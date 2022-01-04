import React from 'react';
import i18next from 'i18next';
import cookies from 'js-cookie';
import LanguageIcon from '@mui/icons-material/Language';
import languages from '../utils/languages.json';
import {Menu, MenuItem} from "@material-ui/core";


const LanguageSelection = (props: { toggle: boolean }) => {
    const {toggle} = props;
    const currentLanguageCode: string = cookies.get('i18next') || 'en';
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <div style={{marginRight: toggle ? 240 : 0, alignSelf: 'center'}}>
            <LanguageIcon
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            />
            <Menu
                id="basic-menu"
                style={{marginTop: 40}}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}>
                {languages.map(lang => <MenuItem
                    key={lang.code} style={{background: `${lang.code === currentLanguageCode ? 'wheat' : 'white'}`,}}
                    onClick={async () => {
                        await i18next.changeLanguage(lang.code);
                        handleClose();
                    }}>{lang.name}</MenuItem>)}
            </Menu>
        </div>
    );
};

export default LanguageSelection;
