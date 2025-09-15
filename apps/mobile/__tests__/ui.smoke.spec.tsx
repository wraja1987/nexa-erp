import React from "react";
import { render } from "@testing-library/react-native";
import Dashboard from "../app/(tabs)/dashboard";
import Finance from "../app/(tabs)/finance";
import POS from "../app/(tabs)/pos";
import ModulesIndex from "../app/modules/index";

it("Dashboard renders",()=>{ const {getByText}=render(<Dashboard/>); expect(getByText("Dashboard")).toBeTruthy(); });
it("Finance renders",()=>{ const {getByText}=render(<Finance/>); expect(getByText("Finance")).toBeTruthy(); });
it("POS renders",()=>{ const {getByText}=render(<POS/>); expect(getByText("Point of Sale")).toBeTruthy(); });
it("Modules index renders",()=>{ const {getByText}=render(<ModulesIndex/>); expect(getByText("Modules")).toBeTruthy(); });
