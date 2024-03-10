import "./ProActNavbar.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faDiagramProject,
    faArrowRightArrowLeft,
    faGaugeHigh,
    faSave,
    faDownload
} from "@fortawesome/free-solid-svg-icons";
import { faFile, IconDefinition, faCircleQuestion, faFolderOpen } from "@fortawesome/free-regular-svg-icons";
import { Link, useLocation } from "react-router-dom";


export interface ProActNavbarProps {
    lowerRowSlot?: any
}


function NavbarLink(props: { icon: IconDefinition, display: string, route: string, title?: string }) {
    const location = useLocation();
    const active = location.pathname === props.route;

    return (
        <Link to={props.route} className={`ENAV-link ${active ? 'ENAV-link--active' : ''}`} title={props.title}>
            <FontAwesomeIcon icon={props.icon} />
            {props.display}
        </Link>
    )
}


export function ProActNavbar(props: ProActNavbarProps) {
    return (
        <div className="ENAV-outer">
            <div className="ENAV-Row ENAV-Row1">
                <Link to="/session" className="ENAV-logo ENAV-link">
                    <img src="/proact.png" alt="" />
                    <span>ProAct</span>
                </Link>
                {/* <div className="ENAV-logo">
                    <img src="/proact.png" alt="" />
                    <span>ProAct</span>
                </div> */}
                <div>
                    <Link to="/session" className="ENAV-new-session ENAV-help" title={"Start a new session by selecting a new OCEL."}>
                        <FontAwesomeIcon icon={faFile} />
                    </Link>
                    <Link to="/user-session/restore" className="ENAV-new-session ENAV-help" title={"Manually restore a previously saved session"}>
                        <FontAwesomeIcon icon={faFolderOpen} />
                    </Link>
                    <Link to="/user-session/store" className="ENAV-new-session ENAV-help" title={"Manually store current session."}>
                        <FontAwesomeIcon icon={faSave} />
                    </Link>

                    <Link to="/help" className="ENAV-new-session" title={"Help page for documentation and trouble-shooting."}>
                        <FontAwesomeIcon icon={faCircleQuestion} />
                    </Link>


                </div>
            </div>
            <div className="ENAV-Row ENAV-Row2">
                <div className="ENAV-links">
                    <NavbarLink icon={faDiagramProject} display="Analysis" route="/" title={"Home page where the DFM is rendered."} />
                    {/* <NavbarLink icon={faArrowRightArrowLeft} display="Alignments" route="/alignments" title={"Alignments shown as table."} /> */}
                    {/* <NavbarLink icon={faGaugeHigh} display="Performance" route="/performance" title={"Performance metrics shown as table."} /> */}
                    <NavbarLink icon={faDiagramProject} display="Monitoring" route="/monitoring" title={"Constraint Monitoring."} />
                    <NavbarLink icon={faDiagramProject} display="Action Engine" route="/action" title={"Action Engine."} />
                    <NavbarLink icon={faDiagramProject} display="Impact Analysis" route="/impact" title={"Impact Analysis."} />
                </div>
                <div className="ENAV-props">
                    {props.lowerRowSlot !== undefined ? props.lowerRowSlot : undefined}
                </div>
            </div>
        </div>
    );
}
