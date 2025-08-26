// envVarUtil.ts

/**
 * Utility function to fetch the value of a Dataverse environment variable by schema name.
 * Returns the value if found, the default value if set, or null.
 */

export async function getEnvironmentVariableValue(schemaName: string, context:ComponentFramework.Context<unknown>): Promise<string | null> {
    if (!schemaName) {
        console.warn("Environment variable schema name not specified.");
        return null;
    }
    try {
        const result = await context.webAPI.retrieveMultipleRecords(
            "environmentvariabledefinition",
            `?$filter=schemaname eq '${schemaName}'&$expand=environmentvariabledefinition_environmentvariablevalue($select=value)`
        );

        console.log("Environment variable query result:", result);

        if (result.entities.length > 0) {
            const envVar = result.entities[0];
            // Prefer value set at environment level
            if (
                envVar.environmentvariabledefinition_environmentvariablevalue &&
                envVar.environmentvariabledefinition_environmentvariablevalue.length > 0 &&
                envVar.environmentvariabledefinition_environmentvariablevalue[0].value
            ) {
                console.log("Using environment-level value:", envVar.environmentvariabledefinition_environmentvariablevalue[0].value);
                return envVar.environmentvariabledefinition_environmentvariablevalue[0].value as string;
            }
            // Fallback to default value on definition
            if (envVar.defaultvalue) {
                console.log("Using environment default value:", envVar.defaultvalue);
                return envVar.defaultvalue as string;
            }
        }
        return null; // Not found
    } catch (error) {
        console.error("Error fetching environment variable:", error);
        return null;
    }
}
