import "./DefaultLayout.css"
import { ProActNavbar } from "../ProActNavbar/ProActNavbar";

type LayoutProps = {
    content?: any
    navbarSlot?: any

    children?: any
}

export function DefaultLayout(props: LayoutProps) {
    return (
        <div className="DefaultLayout-Container">
            <ProActNavbar lowerRowSlot={props.navbarSlot} />
            <div className="DefaultLayout-Content">
                {props.content ? props.content : null}
                {props.children ? props.children : null}
            </div>
        </div>
    )
}
