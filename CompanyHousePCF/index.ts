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

        // Search button text (input property)
        const buttonText = this.context.parameters.buttonSearchText?.raw ?? "Search";

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
        return {
            searchCompanyByName: this.selectedCompanyValue
        };
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this.container);
    }
}
