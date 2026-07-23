// Regenerates load-tests/reports/report.html from whichever of baseline.json /
// stress.json exist in load-tests/reports/. Run automatically after every
// `npm run load-test:baseline` / `load-test:stress`, or manually via
// `npm run load-test:report`. Artillery's own `report` command (HTML output) is
// deprecated upstream in favor of the paid Artillery Cloud dashboard, so this
// replaces it with a small local generator instead.
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.join(__dirname);
const REPORTS_DIR = path.join(ROOT, 'reports');
const CONFIGS_DIR = path.join(ROOT, 'configs');

function fmtMs(v) {
  if (v == null) return '—';
  return v >= 1000 ? (v / 1000).toFixed(2) + 's' : Math.round(v) + 'ms';
}

// Derive phase boundaries straight from the YAML config, so this stays correct
// automatically if phase durations/rates ever change.
function loadPhases(configFile) {
  const parsed = yaml.load(fs.readFileSync(path.join(CONFIGS_DIR, configFile), 'utf8'));
  let start = 0;
  return parsed.config.phases.map((p) => {
    const end = start + p.duration;
    const rateLabel = p.rampTo ? `${p.arrivalRate}→${p.rampTo}/s` : `${p.arrivalRate}/s`;
    const phase = { name: p.name, start, end, rateLabel };
    start = end;
    return phase;
  });
}

function extractRun(jsonFile, phases) {
  const filePath = path.join(REPORTS_DIR, jsonFile);
  if (!fs.existsSync(filePath)) return null;
  const d = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const start = d.intermediate[0].period;

  const series = d.intermediate.map((w) => {
    const rt = w.summaries['http.response_time'] || {};
    const ok = w.counters['http.codes.200'] || 0;
    const errCount = Object.keys(w.counters)
      .filter((k) => k.startsWith('errors.'))
      .reduce((s, k) => s + (w.counters[k] || 0), 0);
    return {
      t: Math.round((w.period - start) / 1000),
      rps: w.rates['http.request_rate'] || 0,
      p50: rt.p50 ?? null,
      p95: rt.p95 ?? null,
      p99: rt.p99 ?? null,
      ok,
      errors: errCount,
      total: ok + errCount,
    };
  });

  const agg = d.aggregate;
  const okReq = agg.counters['http.codes.200'] || 0;
  const errorBreakdown = Object.keys(agg.counters)
    .filter((k) => k.startsWith('errors.'))
    .map((k) => ({ type: k.replace('errors.', ''), count: agg.counters[k] }))
    .sort((a, b) => b.count - a.count);
  const totalErrors = errorBreakdown.reduce((s, e) => s + e.count, 0);
  const vusersCreated = agg.counters['vusers.created'] || 0;
  const vusersCompleted = agg.counters['vusers.completed'] || 0;
  const vusersFailed = agg.counters['vusers.failed'] || 0;
  const errRate = vusersCreated ? +((vusersFailed / vusersCreated) * 100).toFixed(1) : 0;

  const endpoints = Object.keys(agg.summaries)
    .filter((k) => k.startsWith('plugins.metrics-by-endpoint.response_time.'))
    .map((k) => {
      const name = k.replace('plugins.metrics-by-endpoint.response_time.', '');
      const s = agg.summaries[k];
      return { name, p50: s.p50, p95: s.p95, p99: s.p99, count: s.count };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const durationSec = Math.round((agg.lastMetricAt - agg.firstMetricAt) / 1000);
  const firstErrorWindow = series.find((w) => w.errors > 0) || null;
  const peakP95Window = series.reduce((max, w) => ((w.p95 || 0) > (max?.p95 || 0) ? w : max), null);

  // Extend the last configured phase to cover any trailing windows.
  const lastT = series[series.length - 1].t;
  const phaseBounds = phases.map((p, i) => (i === phases.length - 1 ? { ...p, end: Math.max(p.end, lastT) } : p));

  return {
    series,
    phaseBounds,
    durationSec,
    totalAttempted: okReq + totalErrors,
    okReq,
    totalErrors,
    errorBreakdown,
    errRate,
    vusersCreated,
    vusersCompleted,
    vusersFailed,
    p50: agg.summaries['http.response_time'].p50,
    p95: agg.summaries['http.response_time'].p95,
    p99: agg.summaries['http.response_time'].p99,
    max: agg.summaries['http.response_time'].max,
    avgRps: durationSec ? +((okReq + totalErrors) / durationSec).toFixed(1) : 0,
    endpoints,
    firstErrorWindow,
    peakP95Window,
  };
}

function phaseAggregates(run) {
  return run.phaseBounds.map((p) => {
    const windows = run.series.filter((d) => d.t >= p.start && d.t <= p.end);
    const totalOk = windows.reduce((s, d) => s + d.ok, 0);
    const totalErr = windows.reduce((s, d) => s + d.errors, 0);
    const totalReq = totalOk + totalErr;
    const avgRps = windows.length ? (windows.reduce((s, d) => s + d.rps, 0) / windows.length).toFixed(1) : '0';
    const avgP95 = windows.length ? windows.reduce((s, d) => s + (d.p95 || 0), 0) / windows.length : 0;
    const maxP95 = windows.length ? Math.max(...windows.map((d) => d.p95 || 0)) : 0;
    const maxP99 = windows.length ? Math.max(...windows.map((d) => d.p99 || 0)) : 0;
    const errRate = totalReq ? ((totalErr / totalReq) * 100).toFixed(1) : '0.0';
    return { ...p, avgRps, avgP95, maxP95, maxP99, totalOk, totalErr, errRate };
  });
}

function seriesTable(series) {
  const rows = series
    .map(
      (d) =>
        `<tr${d.errors > 0 ? ' style="background:#fdecdc"' : ''}><td>${d.t}s</td><td>${d.rps}</td><td>${fmtMs(d.p50)}</td><td>${fmtMs(d.p95)}</td><td>${fmtMs(d.p99)}</td><td>${d.ok}</td><td>${d.errors}</td></tr>`,
    )
    .join('\n');
  return `<table class="series"><thead><tr><th>Time</th><th>req/s</th><th>p50</th><th>p95</th><th>p99</th><th>ok</th><th>errors</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function phaseTable(phases) {
  const rows = phases
    .map(
      (p) => `<tr${p.errRate !== '0.0' ? ' style="background:#fdecdc"' : ''}>
      <td>${p.name}</td><td>${p.start}s&ndash;${p.end}s</td><td>${p.rateLabel}</td><td>${p.avgRps}/s</td>
      <td>${fmtMs(p.avgP95)}</td><td>${fmtMs(p.maxP95)}</td><td>${fmtMs(p.maxP99)}</td>
      <td>${p.totalOk}</td><td><b>${p.totalErr}</b></td><td><b>${p.errRate}%</b></td>
    </tr>`,
    )
    .join('\n');
  return `<table class="series"><thead><tr><th>Phase</th><th>Window</th><th>Target rate</th><th>Actual avg req/s</th><th>Avg p95</th><th>Max p95</th><th>Max p99</th><th>OK</th><th>Errors</th><th>Error rate</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function statsTableHtml(run) {
  return `<table class="stats">
    <tr><th>Requests attempted</th><td>${run.totalAttempted.toLocaleString()} (${run.okReq.toLocaleString()} succeeded, ${run.totalErrors.toLocaleString()} failed)</td></tr>
    <tr><th>Duration</th><td>${run.durationSec}s</td></tr>
    <tr><th>Avg throughput</th><td>${run.avgRps} req/s attempted</td></tr>
    <tr><th>Virtual-user failure rate</th><td class="${run.errRate > 1 ? 'bad' : 'good'}">${run.errRate}%</td></tr>
    <tr><th>VUs created / completed / failed</th><td>${run.vusersCreated} / ${run.vusersCompleted} / ${run.vusersFailed}</td></tr>
    <tr><th>p50 / p95 / p99 latency <span class="fine">(successful requests only)</span></th><td>${fmtMs(run.p50)} / ${fmtMs(run.p95)} / ${fmtMs(run.p99)}</td></tr>
    <tr><th>Max latency observed</th><td>${fmtMs(run.max)}</td></tr>
  </table>`;
}

function errorBreakdownTable(run) {
  const rows = run.errorBreakdown
    .map((e) => {
      const meaning =
        e.type === 'ERR_SOCKET_TIMEOUT'
          ? 'The server took too long to respond (or never did) &mdash; it was too overloaded to answer in time.'
          : e.type === 'ECONNRESET'
            ? 'The connection was forcibly dropped mid-request &mdash; the server or platform gave up on it.'
            : 'Request failed for this reason.';
      return `<tr><td>${e.type}</td><td><b>${e.count.toLocaleString()}</b></td><td>${meaning}</td></tr>`;
    })
    .join('\n');
  return `<table class="series"><thead><tr><th>Error type</th><th>Count</th><th>What it means</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function endpointBars(baselineEndpoints, stressEndpoints) {
  if (!baselineEndpoints && !stressEndpoints) return '<div class="desc">No data yet.</div>';
  const a = baselineEndpoints || [];
  const b = stressEndpoints || [];
  const stressMap = Object.fromEntries(b.map((e) => [e.name, e]));
  const names = a.length ? a.map((e) => e.name) : b.map((e) => e.name);
  const maxVal = Math.max(1, ...a.map((e) => e.p95), ...b.map((e) => e.p95));
  return names
    .map((name) => {
      const be = a.find((e) => e.name === name);
      const se = stressMap[name];
      const shortName = name === '/' ? '/ (home)' : name;
      const baselineWidth = be ? ((be.p95 / maxVal) * 100).toFixed(1) : 0;
      const stressWidth = se ? ((se.p95 / maxVal) * 100).toFixed(1) : 0;
      return `
      <div class="bar-group">
        <div class="bar-label">${shortName}</div>
        ${
          be
            ? `<div class="bar-row"><span class="bar-tag">baseline</span><div class="bar-track"><div class="bar-fill baseline" style="width:${baselineWidth}%"></div></div><span class="bar-value">${fmtMs(be.p95)}</span></div>`
            : ''
        }
        ${
          se
            ? `<div class="bar-row"><span class="bar-tag">stress</span><div class="bar-track"><div class="bar-fill stress" style="width:${stressWidth}%"></div></div><span class="bar-value">${fmtMs(se.p95)}</span></div>`
            : ''
        }
      </div>`;
    })
    .join('\n');
}

function notRunYet(cmd) {
  return `<div class="note caveat">Not run yet. Run <code>npm run ${cmd}</code> to populate this section.</div>`;
}

function render() {
  const baseline = fs.existsSync(path.join(REPORTS_DIR, 'baseline.json')) ? extractRun('baseline.json', loadPhases('baseline.yml')) : null;
  const stress = fs.existsSync(path.join(REPORTS_DIR, 'stress.json')) ? extractRun('stress.json', loadPhases('stress.yml')) : null;

  const baselinePhases = baseline ? phaseAggregates(baseline) : null;
  const stressPhases = stress ? phaseAggregates(stress) : null;
  const stressBroke = stress && stress.totalErrors > 0;

  const stressStatus = !stress
    ? '<span class="status neutral">Not run yet</span>'
    : stressBroke
      ? '<span class="status broke">App broke under load</span>'
      : '<span class="status full">Ran clean, no failures</span>';

  const breakingStatus = !stress
    ? '<span class="status neutral">Not run yet</span>'
    : stressBroke
      ? '<span class="status broke">Real breaking point found</span>'
      : '<span class="status capped">No failures observed</span>';

  const scalabilityStatus = !stress
    ? '<span class="status neutral">Not run yet</span>'
    : stressBroke
      ? '<span class="status capped">Real ceiling found, no infra comparison</span>'
      : '<span class="status capped">Narrow signal, no failures reached</span>';

  let headline = '';
  if (stress) {
    headline = stressBroke
      ? `<div class="note critical"><b>Headline result:</b> the stress test found a real breaking point.
         <b>${stress.totalErrors.toLocaleString()} of ${stress.totalAttempted.toLocaleString()}</b> attempted requests
         failed (${stress.errRate}% of virtual users), starting around
         <b>t=${stress.firstErrorWindow ? stress.firstErrorWindow.t : '?'}s</b>
         (~${stress.firstErrorWindow ? stress.firstErrorWindow.rps : '?'} req/s attempted).</div>`
      : `<div class="note"><b>Headline result:</b> the stress test completed with <b>0 failures</b>
         (${stress.okReq.toLocaleString()} requests, all succeeded). Peak p95 during the run was
         ${fmtMs(stress.peakP95Window ? stress.peakP95Window.p95 : null)} at
         t=${stress.peakP95Window ? stress.peakP95Window.t : '?'}s &mdash; no failure point was reached.</div>`;
  }

  let breakingSection;
  if (!stress) {
    breakingSection = notRunYet('load-test:stress');
  } else if (stressBroke) {
    breakingSection = `
      <div class="note critical">
        <b>Where it broke:</b> the first failures appeared at <b>t=${stress.firstErrorWindow.t}s</b>, right as the
        target rate crossed roughly <b>${stress.firstErrorWindow.rps} req/s</b> attempted &mdash; p95 latency had
        already jumped to <b>${fmtMs(stress.firstErrorWindow.p95)}</b> in that same window. From there, failures
        continued for the rest of the run.
      </div>
      <div class="desc"><b>Error breakdown</b> (why requests failed, not just that they did):</div>
      ${errorBreakdownTable(stress)}
      <div class="note caveat">
        <b>Reading this:</b> socket timeouts mean the server was too overloaded to respond in time, not actively
        rejecting requests. Connection resets mean the platform or server ran out of connections/resources to hold
        open. Both point to the deployment running out of capacity, not a code-level bug.
      </div>
      <div class="desc">Second-by-second detail around the breaking point (failing rows highlighted):</div>
      ${seriesTable(stress.series.filter((d) => d.t >= Math.max(0, stress.firstErrorWindow.t - 20) && d.t <= stress.firstErrorWindow.t + 80))}`;
  } else {
    breakingSection = `
      <div class="note caveat">
        No failures occurred, so there's no confirmed breaking point here &mdash; only a peak-latency read. The
        highest p95 seen was <b>${fmtMs(stress.peakP95Window.p95)}</b> at t=${stress.peakP95Window.t}s. If the config
        is capped, this is expected: raise the ceiling in <code>stress.yml</code> and re-run to actually find where
        it breaks.
      </div>
      ${seriesTable(stress.series.filter((d) => Math.abs(d.t - stress.peakP95Window.t) <= 50))}`;
  }

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Artillery Load Test Report</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; max-width: 940px; margin: 0 auto; padding: 24px 20px 60px; color: #111; background: #fff; line-height: 1.5; }
  h1 { font-size: 24px; margin-bottom: 4px; }
  h2 { font-size: 18px; margin-top: 44px; padding: 8px 12px; background: #f3f3ee; border-left: 5px solid #2a78d6; }
  h2 .num { color: #888; font-weight: normal; margin-right: 6px; }
  .subtitle { color: #555; font-size: 14px; margin-bottom: 20px; }
  .subtitle code { background: #f0f0f0; padding: 1px 5px; border-radius: 3px; }
  .desc { color: #333; font-size: 14px; margin-bottom: 16px; }
  .fine { color: #888; font-size: 11px; font-weight: normal; }
  .status { display: inline-block; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.03em; padding: 3px 9px; border-radius: 10px; margin-left: 10px; vertical-align: middle; }
  .status.full { background: #e3f5e3; color: #0a7d0a; }
  .status.capped { background: #fdecdc; color: #b8560f; }
  .status.broke { background: #fbdada; color: #a01818; }
  .status.neutral { background: #eee; color: #666; }
  table.stats { border-collapse: collapse; margin-bottom: 20px; }
  table.stats th, table.stats td { text-align: left; padding: 6px 16px 6px 0; border-bottom: 1px solid #eee; font-size: 14px; }
  table.stats th { color: #555; font-weight: normal; }
  table.stats td { font-weight: bold; }
  table.stats td.good { color: #0a7d0a; }
  table.stats td.bad { color: #a01818; }
  table.series { border-collapse: collapse; width: 100%; font-size: 13px; margin-top: 8px; }
  table.series th, table.series td { text-align: right; padding: 4px 8px; border-bottom: 1px solid #eee; }
  table.series th:first-child, table.series td:first-child { text-align: left; }
  table.series thead th { color: #555; border-bottom: 2px solid #ccc; }
  details { margin: 12px 0 20px; }
  summary { cursor: pointer; color: #0645ad; font-size: 14px; }
  summary:hover { text-decoration: underline; }
  .bar-group { margin-bottom: 14px; }
  .bar-label { font-size: 13px; font-weight: bold; margin-bottom: 4px; }
  .bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
  .bar-tag { width: 60px; font-size: 12px; color: #555; flex-shrink: 0; }
  .bar-track { flex: 1; background: #f0f0f0; border-radius: 3px; height: 16px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 3px; }
  .bar-fill.baseline { background: #2a78d6; }
  .bar-fill.stress { background: #eb6834; }
  .bar-value { width: 60px; font-size: 12px; text-align: right; flex-shrink: 0; }
  .legend { font-size: 13px; margin: 8px 0 16px; }
  .legend span { display: inline-block; width: 12px; height: 12px; border-radius: 2px; margin-right: 5px; vertical-align: middle; }
  .note { background: #f7f7f2; border-left: 4px solid #2a78d6; padding: 10px 14px; font-size: 13px; margin: 12px 0 20px; }
  .note.caveat { border-left-color: #b8560f; background: #fdf6ee; }
  .note.critical { border-left-color: #a01818; background: #fdeeee; }
  footer { margin-top: 50px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 12px; }
  .toc { font-size: 14px; margin: 16px 0 8px; }
  .toc ol { margin: 6px 0 0 20px; padding: 0; }
  .toc a { color: #0645ad; text-decoration: none; }
  .toc a:hover { text-decoration: underline; }
  .generated { color: #999; font-size: 11px; margin-top: 6px; }
</style>
</head>
<body>

  <h1>Artillery Load Test Report</h1>
  <div class="subtitle">
    Target: <code>https://stagecraftlabs.com</code> &middot; Tool: <code>artillery 2.0.33</code> &middot;
    Black-box, page-level test (homepage + 8 practice-lab routes, no API/auth replay)
  </div>
  <div class="generated">Regenerated: ${new Date().toISOString()}</div>

  ${headline}

  <div class="toc">
    Jump to:
    <ol>
      <li><a href="#concurrent">Concurrent user simulation</a></li>
      <li><a href="#load">Load testing</a></li>
      <li><a href="#metrics">Performance metrics</a></li>
      <li><a href="#stress">Stress testing</a></li>
      <li><a href="#breaking">Breaking point analysis</a></li>
      <li><a href="#scalability">Scalability testing</a></li>
      <li><a href="#throughput">Throughput analysis</a></li>
    </ol>
  </div>

  <h2 id="concurrent"><span class="num">1</span>Concurrent user simulation<span class="status full">Fully implemented</span></h2>
  <div class="desc">Both configs spawn multiple independent virtual users per second (Artillery's <code>arrivalRate</code>), each running the full page-visit flow concurrently with the others.</div>
  <table class="stats">
    ${baseline ? `<tr><th>Baseline &mdash; virtual users</th><td>${baseline.vusersCreated} created (${baseline.vusersCompleted} completed, ${baseline.vusersFailed} failed)</td></tr>` : ''}
    ${stress ? `<tr><th>Stress &mdash; virtual users</th><td>${stress.vusersCreated} created (${stress.vusersCompleted} completed, <span class="bad">${stress.vusersFailed} failed</span>)</td></tr>` : ''}
    ${stress ? `<tr><th>Peak arrival rate attempted</th><td>${Math.max(...stress.series.map((d) => d.rps))} req/s</td></tr>` : ''}
  </table>
  ${!baseline ? notRunYet('load-test:baseline') : ''}

  <h2 id="load"><span class="num">2</span>Load testing<span class="status full">Fully implemented</span></h2>
  <div class="desc"><code>load-tests/configs/baseline.yml</code> &mdash; steady-state load, gated by <code>ensure</code> thresholds (p95 &lt; 3000ms, error rate &lt; 1%).</div>
  ${baseline ? statsTableHtml(baseline) : notRunYet('load-test:baseline')}
  ${baseline ? `<details><summary>Show per-10s-window data (${baseline.series.length} rows)</summary>${seriesTable(baseline.series)}</details>` : ''}

  <h2 id="metrics"><span class="num">3</span>Performance metrics<span class="status full">Fully implemented</span></h2>
  <div class="desc">Artillery's built-in aggregate metrics. Latency percentiles only reflect requests that got a response &mdash; failed (timed out/reset) requests are counted separately.</div>
  ${
    baseline || stress
      ? `<table class="series"><thead><tr><th>Metric</th><th>Baseline</th><th>Stress</th></tr></thead><tbody>
    <tr><td>Requests attempted</td><td>${baseline ? baseline.totalAttempted : '—'}</td><td>${stress ? stress.totalAttempted : '—'}</td></tr>
    <tr><td>Requests succeeded</td><td>${baseline ? baseline.okReq : '—'}</td><td>${stress ? stress.okReq : '—'}</td></tr>
    <tr><td>Requests failed</td><td>${baseline ? baseline.totalErrors : '—'}</td><td>${stress ? `<b>${stress.totalErrors}</b>` : '—'}</td></tr>
    <tr><td>VU failure rate</td><td>${baseline ? baseline.errRate : '—'}%</td><td>${stress ? `<b>${stress.errRate}%</b>` : '—'}</td></tr>
    <tr><td>Avg throughput attempted</td><td>${baseline ? baseline.avgRps : '—'}/s</td><td>${stress ? stress.avgRps : '—'}/s</td></tr>
    <tr><td>p50 latency</td><td>${baseline ? fmtMs(baseline.p50) : '—'}</td><td>${stress ? fmtMs(stress.p50) : '—'}</td></tr>
    <tr><td>p95 latency</td><td>${baseline ? fmtMs(baseline.p95) : '—'}</td><td>${stress ? fmtMs(stress.p95) : '—'}</td></tr>
    <tr><td>p99 latency</td><td>${baseline ? fmtMs(baseline.p99) : '—'}</td><td>${stress ? fmtMs(stress.p99) : '—'}</td></tr>
    <tr><td>Max latency observed</td><td>${baseline ? fmtMs(baseline.max) : '—'}</td><td>${stress ? fmtMs(stress.max) : '—'}</td></tr>
  </tbody></table>`
      : notRunYet('load-test:baseline')
  }

  <h2 id="stress"><span class="num">4</span>Stress testing${stressStatus}</h2>
  <div class="desc"><code>load-tests/configs/stress.yml</code> &mdash; ramps arrival rate (see config for current target rate) to find where a cheap, single-user, non-autoscaling Azure App Service plan actually gives out.</div>
  ${stress ? phaseTable(stressPhases) : notRunYet('load-test:stress')}

  <h2 id="breaking"><span class="num">5</span>Breaking point analysis${breakingStatus}</h2>
  ${breakingSection}

  <h2 id="scalability"><span class="num">6</span>Scalability testing${scalabilityStatus}</h2>
  <div class="desc">Reading how latency and error rate shift as concurrency scales up, across the phases already run.</div>
  <div class="note caveat"><b>Limitation:</b> this is a single-deployment signal, not a scalability comparison &mdash; it doesn't (and can't, black-box) test how a larger App Service tier, autoscaling, or a CDN in front would change the ceiling.</div>
  ${baseline ? phaseTable(baselinePhases) : ''}
  ${stress ? phaseTable(stressPhases) : ''}
  ${!baseline && !stress ? notRunYet('load-test:baseline') : ''}

  <h2 id="throughput"><span class="num">7</span>Throughput analysis<span class="status full">Fully implemented</span></h2>
  <div class="desc">Requests-per-second attempted and actually served, per run.</div>
  <table class="stats">
    ${baseline ? `<tr><th>Baseline avg throughput</th><td>${baseline.avgRps} req/s (${baseline.errRate}% failed)</td></tr>` : ''}
    ${stress ? `<tr><th>Stress avg throughput attempted</th><td>${stress.avgRps}/s</td></tr>` : ''}
    ${stress ? `<tr><th>Stress peak throughput attempted</th><td>${Math.max(...stress.series.map((d) => d.rps))} req/s</td></tr>` : ''}
    ${stress ? `<tr><th>Stress effective successful throughput</th><td>~${Math.round(stress.okReq / stress.durationSec)} req/s actually served</td></tr>` : ''}
  </table>
  ${!baseline && !stress ? notRunYet('load-test:baseline') : ''}
  ${
    baseline || stress
      ? `<details><summary>Show full per-10s-window throughput data</summary>
    ${baseline ? `<div class="desc" style="margin-top:10px"><b>Baseline</b></div>${seriesTable(baseline.series)}` : ''}
    ${stress ? `<div class="desc" style="margin-top:10px"><b>Stress</b></div>${seriesTable(stress.series)}` : ''}
  </details>`
      : ''
  }

  <h2 id="endpoints"><span class="num">&bull;</span>Bonus: per-page p95 latency, baseline vs. stress</h2>
  <div class="legend"><span style="background:#2a78d6"></span>baseline &nbsp;&nbsp;<span style="background:#eb6834"></span>stress</div>
  ${endpointBars(baseline ? baseline.endpoints : null, stress ? stress.endpoints : null)}

  <footer>
    Generated from real Artillery runs against production. Source: <code>load-tests/reports/baseline.json</code> and
    <code>load-tests/reports/stress.json</code>. Regenerated automatically after every
    <code>npm run load-test:baseline</code> / <code>load-test:stress</code>, or manually via
    <code>npm run load-test:report</code>. Artillery's own <code>report</code> command (HTML output) is deprecated
    upstream in favor of the paid Artillery Cloud dashboard, so this page is built by hand from the raw JSON logs
    instead.
  </footer>

</body>
</html>
`;

  fs.writeFileSync(path.join(REPORTS_DIR, 'report.html'), html);
  console.log('Wrote load-tests/reports/report.html');
}

render();
