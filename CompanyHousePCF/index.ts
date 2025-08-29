import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { CompanyHouseSearchApp } from "./components/CompanyHouseSearchApp";
import { getEnvironmentVariableValue } from "./utils/envVarUtil";

export class CompanyHousePCF implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container!: HTMLDivElement;
    private context!: ComponentFramework.Context<IInputs>;
    private selectedCompanyValue = "";
    private notifyOutputChanged!: () => void;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        _state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this.context = context;
        this.container = container;
        this.notifyOutputChanged = notifyOutputChanged;
        this.renderApp();
    }

    private async renderApp() {
        // Get company name (bound column)
        const companyName = this.context.parameters.companyName?.raw ?? "";

        // Environment variable name for endpoint
        const endpointVariableName = this.context.parameters.searchCompanyEndpointEnvironmentVariable?.raw ?? "";
        const searchEndPoint = await getEnvironmentVariableValue(endpointVariableName, this.context);
        const itemsToRetrieve = this.context.parameters.ItemsToRetrieve?.raw ?? "25";
        // Search button text (input property)
        const buttonText = this.context.parameters.buttonSearchText?.raw ?? "Search";
        const buttonColor = this.context.parameters.buttonColor?.raw ?? "";
        const buttonTextColor = this.context.parameters.buttonTextColor?.raw ?? "";

        if (!searchEndPoint) {
            this.container.innerHTML =
                "<div style='color:red;'>Error: Search endpoint environment variable not configured or not found.</div>";
            return;
        }

        ReactDOM.render(
            React.createElement(CompanyHouseSearchApp, {
                endpoint: searchEndPoint,
                companyName: companyName,
                buttonText: buttonText,
                buttonColor: buttonColor,
                buttonTextColor: buttonTextColor,
                itemsToRetrieve: itemsToRetrieve,
                onSelectCompany: (value: string) => {
                    this.selectedCompanyValue = value;
                    this.notifyOutputChanged();
                },
            }),
            this.container
        );
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this.context = context;
        this.renderApp();
    }

    public getOutputs(): IOutputs {
        const parts = this.selectedCompanyValue.split("|");

        const companyName = parts[0] || "";
        const companyNumber = parts[1] || "";
        const fullAddress = parts[2] || "";

        // Split address by comma and trim spaces
        const addressParts = fullAddress.split(",").map(p => p.trim());

        let address1 = "";
        let address2 = "";
        let address3 = "";
        let address4 = "";
        let country = "";
        let postcode = "";

        if (addressParts.length >= 2) {
            postcode = addressParts[addressParts.length - 1];
            country = addressParts[addressParts.length - 2];
        }

        const mainParts = addressParts.slice(0, -2); // everything except country+postcode

        if (mainParts.length > 0) address1 = mainParts[0];
        if (mainParts.length > 1) address2 = mainParts[1];
        if (mainParts.length > 2) address3 = mainParts[2];
        if (mainParts.length > 3) address4 = mainParts.slice(3).join(", ");

        // Parse company created date (dd/MM/yyyy expected)
        let createdDate: Date | undefined;
        if (parts[3]) {
            const dateParts = parts[3].split("/");
            if (dateParts.length === 3) {
                const day = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1; // months are 0-based
                const year = parseInt(dateParts[2], 10);

                const parsedDate = new Date(year, month, day);
                if (!isNaN(parsedDate.getTime())) {
                    createdDate = parsedDate;
                }
            }
        }

        return {
            companyName,
            companynumber: companyNumber,
            address1,
            address2,
            address3,
            address4,
            postcode,
            country,
            companyCreated: createdDate
        };
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this.container);
    }
}
