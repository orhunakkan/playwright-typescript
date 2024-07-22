class Utility {
  getBaseUrl() {
    const envi = process.env.ENV;

    switch (envi) {
      case "perf":
        return "https://compass-perf.aspirion.com";
      case "uat":
        return "https://helix-uat.aspirion.com";
      case "qa":
        return "https://helix-qa.aspirion.com";
      case "f001":
        return "https://compass-f001.aspirion.com";
      case "f002":
        return "https://compass-f002.aspirion.com";
      case "f003":
        return "https://compass-f003.aspirion.com";
      case "f004":
        return "https://compass-f004.aspirion.com";
      case "f005":
        return "https://compass-f005.aspirion.com";
      case "f006":
        return "https://compass-f006.aspirion.com";
      case "f007":
        return "https://compass-f007.aspirion.com";
      case "f008":
        return "https://compass-f008.aspirion.com";
      case "f008":
        return "https://helix-f008.aspirion.com";
      default:
        throw new Error(
          'Environment variable "ENV" is not declared or has an invalid value.'
        );
    }
  }

  getAPIUrl() {
    const envi = process.env.ENV;

    switch (envi) {
      case "perf":
        return "https://ion-eus2-compass-apim-perf.azure-api.net";
      case "uat":
        return "https://ion-eus2-compass-apim-uat.azure-api.net";
      case "qa":
        return "https://ion-eus2-compass-apim-qa.azure-api.net";
      case "f001":
        return "https://ion-eus2-compass-apim-f001.azure-api.net";
      case "f002":
        return "https://ion-eus2-compass-apim-f002.azure-api.net";
      case "f003":
        return "https://ion-eus2-compass-apim-f003.azure-api.net";
      case "f004":
        return "https://ion-eus2-compass-apim-f004.azure-api.net";
      case "f005":
        return "https://ion-eus2-compass-apim-f005.azure-api.net";
      case "f006":
        return "https://ion-eus2-compass-apim-f006.azure-api.net";
      case "f007":
        return "https://ion-eus2-compass-apim-f007.azure-api.net";
      case "f008":
        return "https://ion-eus2-compass-apim-f008.azure-api.net";
      default:
        throw new Error(
          'Environment variable "ENV" is not declared or has an invalid value.'
        );
    }
  }
}

module.exports = Utility;
