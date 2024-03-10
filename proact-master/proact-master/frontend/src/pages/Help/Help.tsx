import { ProActNavbar } from "../../components/ProActNavbar/ProActNavbar";
import "../../components/DefaultLayout/DefaultLayout.css";
import "./Help.css";
import React, { useState } from "react";
import { Button, Stack, Pagination } from "@mui/material";
import { getURI } from "../../hooks";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
// @ts-ignore
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";
import 'react-pdf/dist/esm/pdf.worker.entry.js';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
// @ts-ignore
import Pdf from '../Help/User_manual.pdf'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUndo, faFileArchive, faBiohazard, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import '../../components/ProActNavbar/NavbarButton/NavbarButton.css';

/**
 * Clears the whole cache in the backend as attempt to fix ProAct if something has gone seriously wrong.
 */
async function clearCache() {
    const uri = getURI("/logs/clear_cache", {});
    await fetch(uri)
        .then((response) => response.json())
        .then((result) => {
            console.log("All cached data was deleted");
        })
        .catch(err => console.log("Error in deleting ..."));
    return "Successful";
}

interface Props {
    resetQueryState: any
}

/**
 * Resets the local storage item "proact-currentOcel" to the default value. After going back to the Home page
 * and refreshing, it should go back to show the default ocel.
 */
function resetLocalStorage() {
    // set to demo ocel
    localStorage.setItem("proact-currentOcel", "uploaded/demo_ocel.jsonocel");
}

export function Help(props: Props) {

    const [panicButtonOpen, setPanicButtonOpen] = useState(false);
    const [localStorageOpen, setLocalStorageOpen] = useState(false);
    const [resetQueryOpen, setResetQueryOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);

    // @ts-ignore
    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    }

    const setPage = (event: React.ChangeEvent<unknown>, value: number) => {
        if (value >= 1 && numPages && value <= numPages) {
            setPageNumber(value);
        }
    }

    const toggleShowAll = () =>
        setShowAll(!showAll);

    const panicButtonText = (
        <React.Fragment>
            <p>
                This button completely clears the long term cache (on your drive) and also the redis cache containing tasks. Once deleted, they can't be restored
                and for each OCEL all computations need to be redone. The purpose of this button is to try to trouble-shoot if something has gone seriously wrong.
            </p>
            <p>
                Only press yes, if you know what you are doing.
            </p>
        </React.Fragment>
    )

    const panicButtonTitle = "Are you sure you want to clear the entire cache?"

    const panicButtonDialog = helpDialog(panicButtonOpen, setPanicButtonOpen, panicButtonText, panicButtonTitle, clearCache)

    const localStorageText = (
        <React.Fragment>
            <p>
                By clicking this button, you will reset the "proact-currentOcel" item in the local storage. Upon returning to the Homepage and refreshing the page, the default OCEL should be displayed once again. This button is intended to help you resolve serious issues. Only click "yes" if you are certain about what you are doing.
            </p>
        </React.Fragment>
    )

    const localStorageTitle = "Are you sure you want to reset the local storage item?"

    const localStorageDialog = helpDialog(localStorageOpen, setLocalStorageOpen, localStorageText, localStorageTitle, resetLocalStorage)

    const resetQueryText = (
        <React.Fragment>
            <p>
                Clicking this button will reset the queries for DFM, Alignments, and Performance Metrics. The button is designed to aid in troubleshooting if a significant issue arises. Only click "yes" if you are certain about what you are doing.
            </p>
        </React.Fragment>
    )

    const resetQueryTitle = "Are you sure you want to reset the current query states?"

    const resetQueryDialog = helpDialog(resetQueryOpen, setResetQueryOpen, resetQueryText, resetQueryTitle, props.resetQueryState)

    return (
        <div className="DefaultLayout-Container">
            <ProActNavbar />
            <div className="DefaultLayout-Content Help-Card">
                <div className="Help-Card-Title-Container">
                    <h2 className="Help-Card-Title">
                        Trouble-shoot & Docs
                    </h2>
                    <div className={'NavbarButton PanicButton'}
                        onClick={() => setPanicButtonOpen(true)}
                        title={"Clear the whole cache."}>
                        <FontAwesomeIcon icon={faBiohazard} className="NavbarButton-Icon" />
                        Panic button
                    </div>
                    {panicButtonDialog}
                    <div className={'NavbarButton'}
                        onClick={() => setResetQueryOpen(true)}
                        title={"Resets the current query states."}>
                        <FontAwesomeIcon icon={faUndo} className="NavbarButton-Icon" />
                        Clear queries
                    </div>
                    {resetQueryDialog}
                    <div className={'NavbarButton'}
                        onClick={() => { setLocalStorageOpen(true); }}
                        title={"Resets the local storage item to the default."}>
                        <FontAwesomeIcon icon={faUndo} className="NavbarButton-Icon" />
                        Reset localStorage
                    </div>
                    {localStorageDialog}
                    <div className={'NavbarButton'}
                        title={"Opens the backend swagger interface in a new tab."}>
                        <FontAwesomeIcon icon={faFileArchive} className="NavbarButton-Icon" />
                        <a className={"Help-a"} href="http://localhost:8080/docs" target="_blank" rel="noreferrer">
                            Backend Docs
                        </a>
                    </div>
                </div>
                <div style={{ width: "80%", height: "80%" }} className={"Help-Card-Docs-Container"}>
                    <nav>
                        <Stack spacing={0.1} direction="column" justifyContent="center">
                            <Stack direction="row" justifyContent="center">
                                <Pagination
                                    count={numPages}
                                    page={pageNumber}
                                    onChange={setPage}
                                    showFirstButton
                                    showLastButton
                                />
                            </Stack>
                            <Stack spacing={2} direction="row" justifyContent="center">
                                <div className={'NavbarButton'}
                                    onClick={toggleShowAll}
                                    title={"Toggles the page view."}>
                                    <FontAwesomeIcon icon={showAll ? faEyeSlash : faEye} className="NavbarButton-Icon" />
                                    {!showAll ? "Show all pages" : "Hide all pages"}
                                </div>
                            </Stack>
                        </Stack>
                    </nav>
                    <Document file={Pdf} onLoadSuccess={onDocumentLoadSuccess} onLoadError={console.error}>
                        {!showAll &&
                            <Page pageNumber={pageNumber} scale={1.7}></Page>
                        }
                        {showAll &&
                            <React.Fragment>
                                <div>
                                    {Array.from(new Array(numPages), (el, index) => (
                                        <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={1.7} />
                                    ))}
                                </div>
                            </React.Fragment>
                        }
                    </Document>
                    {showAll &&
                        <Stack spacing={2} direction="row" justifyContent="center">
                            <div className={'NavbarButton'}
                                onClick={toggleShowAll}
                                title={"Toggles the page view."}>
                                <FontAwesomeIcon icon={showAll ? faEyeSlash : faEye} className="NavbarButton-Icon" />
                                {!showAll ? "Show all pages" : "Hide all pages"}
                            </div>
                        </Stack>
                    }
                </div>
            </div>
        </div>
    );
}

/**
 * Used to modularize the dialog which is shown when one of the trouble-shoot buttons is pressed.
 * @param open - Boolean which decides if the dialog is shown (open)
 * @param setOpen - Sets the "open" variable (state)
 * @param text - The text to be displayed in the dialog
 * @param title - The title of the dialog
 * @param onClick - Function which determines what happens when "Yes" is clicked in the dialog.
 */
function helpDialog(open: boolean, setOpen: { (value: React.SetStateAction<boolean>): void; }, text: any, title: any, onClick: any) {
    return (
        <Dialog
            open={open}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {text}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)} autoFocus>No</Button>
                <Button onClick={() => {
                    onClick();
                    setOpen(false);
                }}>Yes</Button>
            </DialogActions>
        </Dialog>
    )
}
