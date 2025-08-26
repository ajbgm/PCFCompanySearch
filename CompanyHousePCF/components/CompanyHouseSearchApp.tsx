import * as React from "react";
import { useState } from "react";
import axios from "axios";
import { DefaultButton } from "@fluentui/react";
import { BuildingIcon, NumberIcon, AddressIcon, CalendarIcon } from "./icons/CustomIcons";

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
    itemsToRetrieve: string;
    buttonColor?: string;
    buttonTextColor?: string;
    // PCF property binding
    onSelectCompany: (value: string) => void;
}

export const CompanyHouseSearchApp: React.FC<Props> = ({ endpoint, companyName, buttonText, buttonColor, buttonTextColor, itemsToRetrieve, onSelectCompany }) => {
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
                { CompanyName: companyName, ItemsToRetrieve: itemsToRetrieve },
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
    };

    const handleConfirm = () => {
        if (selectedIndex !== null) {
            const company = results[selectedIndex];
            const pipeValue = `${company.Name}|${company.CompanyNumber}|${company.Address}|${new Date(company.DateOfCreation).toLocaleDateString("en-GB")}`;
            onSelectCompany(pipeValue);
        }

        // Clear UI after confirming
        setResults([]);
        setSelectedIndex(null);
        setHasSearched(false);
    };

    const handleClear = () => {
        setResults([]);
        setSelectedIndex(null);
        setHasSearched(false);
    };

    const handleReset = () => {
        setResults([]);
        setSelectedIndex(null);
        setHasSearched(false);
    };

    const selectedCompany = selectedIndex !== null ? results[selectedIndex] : null;

    return (
        <div style={{ width: "100%", fontFamily: "Segoe UI" }}>
            {/* Company Name Display + Button */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10, gap: 10 }}>
                <DefaultButton
                    text={loading ? "Searching..." : buttonText}
                    onClick={handleSearch}
                    disabled={loading}
                    styles={
                        buttonColor || buttonTextColor
                            ? {
                                root: {
                                    ...(buttonColor ? { backgroundColor: buttonColor } : {}),
                                    ...(buttonTextColor ? { color: buttonTextColor } : {}),
                                },
                                rootHovered: {
                                    ...(buttonColor ? { backgroundColor: buttonColor } : {}),
                                    ...(buttonTextColor ? { color: buttonTextColor } : {}),
                                }
                            }
                            : undefined
                    }
                />


                {/* Reset button: visible only after search and no company selected */}
                {hasSearched && results.length > 0 && selectedIndex === null && (
                    <DefaultButton
                        text="Reset"
                        onClick={handleReset}
                        styles={
                            buttonColor || buttonTextColor
                                ? {
                                    root: {
                                        ...(buttonColor ? { backgroundColor: buttonColor } : {}),
                                        ...(buttonTextColor ? { color: buttonTextColor } : {}),
                                    },
                                    rootHovered: {
                                        ...(buttonColor ? { backgroundColor: buttonColor } : {}),
                                        ...(buttonTextColor ? { color: buttonTextColor } : {}),
                                    }
                                }
                                : undefined
                        }
                    />
                )}
            </div>

            {/* Confirmation Panel */}
            {selectedCompany && (
                <div
                    style={{
                        marginBottom: 15,
                        padding: 10,
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        background: "#f8f8f8"
                    }}
                >
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center" }}>
                        <span style={{ display: "flex", alignItems: "center" }}><BuildingIcon /> <span style={{ marginLeft: 5 }}>{selectedCompany.Name}</span></span>
                        <span style={{ display: "flex", alignItems: "center" }}><NumberIcon /> <span style={{ marginLeft: 5 }}>{selectedCompany.CompanyNumber}</span></span>
                        <span style={{ display: "flex", alignItems: "center" }}><AddressIcon /> <span style={{ marginLeft: 5 }}>{selectedCompany.Address}</span></span>
                        <span style={{ display: "flex", alignItems: "center" }}><CalendarIcon /> <span style={{ marginLeft: 5 }}>{new Date(selectedCompany.DateOfCreation).toLocaleDateString("en-GB")}</span></span>
                    </div>

                    {/* Confirm & Clear buttons */}
                    <div style={{ marginTop: 10, display: "flex", gap: "10px" }}>
                        <DefaultButton
                            text="Confirm"
                            onClick={handleConfirm}
                            styles={
                                buttonColor || buttonTextColor
                                    ? {
                                        root: {
                                            ...(buttonColor ? { backgroundColor: buttonColor } : {}),
                                            ...(buttonTextColor ? { color: buttonTextColor } : {}),
                                        },
                                        rootHovered: {
                                            ...(buttonColor ? { backgroundColor: buttonColor } : {}),
                                            ...(buttonTextColor ? { color: buttonTextColor } : {}),
                                        }
                                    }
                                    : undefined
                            }
                        />
                        <DefaultButton
                            text="Clear"
                            onClick={handleClear}
                            styles={
                                buttonColor || buttonTextColor
                                    ? {
                                        root: {
                                            ...(buttonColor ? { backgroundColor: buttonColor } : {}),
                                            ...(buttonTextColor ? { color: buttonTextColor } : {}),
                                        },
                                        rootHovered: {
                                            ...(buttonColor ? { backgroundColor: buttonColor } : {}),
                                            ...(buttonTextColor ? { color: buttonTextColor } : {}),
                                        }
                                    }
                                    : undefined
                            }
                        />
                    </div>
                </div>
            )}

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
                                            backgroundColor: selectedIndex === index ? "#f0f0f0" : "transparent",
                                            cursor: "pointer"
                                        }}
                                        onClick={() => handleSelect(index)}
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
                                                    e.stopPropagation();
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
