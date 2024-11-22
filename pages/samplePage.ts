export class SamplePage {

    readonly firstNameInput: string;
    readonly lastNameInput: string;
    readonly jobTitleInput: string;
    readonly radioButton: string;
    readonly checkbox: string;
    readonly dropdownOption: string;
    readonly datepicker: string;
    readonly submitButton: string;
    readonly successMessage: string;

    constructor() {
        this.firstNameInput = '#first-name';
        this.lastNameInput = '#last-name';
        this.jobTitleInput = '#job-title';
        this.radioButton = '#radio-button-2';
        this.checkbox = '#checkbox-1';
        this.dropdownOption = 'option[value="1"]';
        this.datepicker = '#datepicker';
        this.submitButton = '.btn.btn-lg.btn-primary';
        this.successMessage = '.alert.alert-success';
    }
}