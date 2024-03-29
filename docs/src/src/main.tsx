import React from "react";
import ReactDOM from "react-dom/client";
import { FlowPostPage } from "./components/Flow.tsx";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <FlowPostPage />
    </React.StrictMode>
);
