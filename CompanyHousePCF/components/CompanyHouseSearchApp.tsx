import * as React from "react";
import { useState } from "react";
import axios from "axios";
import { Icon, DefaultButton } from "@fluentui/react";

export interface ICompanyResult {
    Name: string;
    CompanyNumber: string;
    Address: string;
    DateOfCreation: string;
    Status: string | null;
}

interface Props {
    endpoint: string;
    companyName: string;
    buttonText: string;
    // PCF property binding
    onSelectCompany: (value: string) => void;
}

export const CompanyHouseSearchApp: React.FC<Props> = ({ endpoint, companyName, buttonText, onSelectCompany }) => {
    const [results, setResults] = useState<ICompanyResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [hasSearched, setHasSearched] = useState(false); // track if search was performed

    const handleSearch = async () => {
        if (!companyName) {
            alert("No company name provided from the record.");
            return;
        }
        if (!endpoint) {
            alert("Search endpoint is required.");
            return;
        }

        try {
            setLoading(true);
            setHasSearched(true); // mark that user has clicked search
            const response = await axios.post<ICompanyResult[]>(
                endpoint,
                { CompanyName: companyName },
                { headers: { "Content-Type": "application/json" } }
            );
            setResults(response.data);
        } catch (error) {
            console.error("API error:", error);
            alert("Error fetching companies. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (index: number) => {
        setSelectedIndex(index);
        const company = results[index];
        // Bind pipe-separated value to PCF property
        const pipeValue = `${company.Name}|${company.CompanyNumber}|${company.Address}|${new Date(company.DateOfCreation).toLocaleDateString("en-GB")}`;
        onSelectCompany(pipeValue);
    };

    return (
        <div style={{ width: "100%", fontFamily: "Segoe UI" }}>
            {/* Company Name Display + Button */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                <DefaultButton
                    text={loading ? "Searching..." : buttonText}
                    onClick={handleSearch}
                    disabled={loading}
                />
            </div>

            {/* Results Table */}
            <div style={{ overflowX: "auto" }}>
                {results.length === 0 && !loading && hasSearched ? (
                    <p>No results found.</p>
                ) : (
                    results.length > 0 && (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ textAlign: "left", borderBottom: "2px solid #ccc", background: "#f9f9f9" }}>
                                    <th style={{ padding: "10px" }}>Name</th>
                                    <th style={{ padding: "10px" }}>Company Number</th>
                                    <th style={{ padding: "10px" }}>Address</th>
                                    <th style={{ padding: "10px" }}>Date Of Creation</th>
                                    <th style={{ padding: "10px" }}>Select</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((company, index) => (
                                    <tr
                                        key={company.CompanyNumber}
                                        style={{ 
                                            borderBottom: "1px solid #eee",
                                            backgroundColor: selectedIndex === index ? "#f0f0f0" : "transparent"
                                        }}
                                        onClick={() => handleSelect(index)} // select row on click
                                    >
                                        <td style={{ padding: "8px" }}>{company.Name}</td>
                                        <td style={{ padding: "8px" }}>{company.CompanyNumber}</td>
                                        <td style={{ padding: "8px" }}>{company.Address}</td>
                                        <td style={{ padding: "8px" }}>{new Date(company.DateOfCreation).toLocaleDateString("en-GB")}</td>
                                        <td style={{ padding: "8px", textAlign: "center" }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIndex === index}
                                                onChange={(e) => {
                                                    e.stopPropagation(); // prevent triggering row click twice
                                                    handleSelect(index);
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    )
                )}
            </div>
        </div>
    );
};
