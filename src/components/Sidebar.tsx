import React, {FC} from "react";
import {styled, useTheme, Theme, CSSObject} from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, {AppBarProps as MuiAppBarProps} from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import DataObjectIcon from '@mui/icons-material/DataObject';
import {Button, Box, List, Divider, IconButton, Toolbar, ListItem, ListItemIcon, ListItemText} from '@mui/material';
import LanguageSelection from "./LanguageSelection";
import {useTranslation} from 'react-i18next';
import SearchAppBar from "./SearchBar";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(9)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

interface IProps {
    isAdmin: Boolean;
    links?: Array<any>;
    setToggle?: (stage: string) => void;
    setSchema?: (obj: any) => void;
    returnToDashboard?: (stage: string) => void;
    schema?: any;
    schemas?: Array<any>;
    search?: (stage: string) => void;
}


interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
    setToggle?: (b: boolean) => void;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme, open}) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, {shouldForwardProp: (prop) => prop !== 'open'})(
    ({theme, open}) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

const SideBar: FC<IProps> = ({
                                 setToggle, links, returnToDashboard,
                                 isAdmin, search, setSchema, schema, schemas
                             }: IProps) => {
    const {t} = useTranslation();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    return (
        <Box sx={{display: 'flex', overflow: 'hidden'}}>
            <AppBar position="static" sx={{background: '#FFA500', width: '100%'}}
                    open={open}>
                <Toolbar sx={{display: 'flex', justifyContent: 'space-between'}}>
                    <div>
                        {isAdmin ? <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            edge="start"
                            sx={{
                                marginRight: '36px',
                                ...(open && {display: 'none'}),
                            }}
                        ><MenuIcon/></IconButton> : null}
                        <Button sx={{my: 2, color: 'white', mx: !isAdmin ? 7 : 0}} onClick={() => {
                            if (setToggle && isAdmin) {
                                setToggle('Dashboard');
                            } else if (setSchema) {
                                setSchema({properties: {}});
                            }
                        }}>{t(isAdmin ? 'dashboard' : 'userDashboard')}</Button>
                    </div>
                    <div style={{display: 'flex'}}>
                        {!isAdmin && Object.keys(schema.properties).length < 1 ?
                            <SearchAppBar search={search} schemas={schemas}/> : null}
                        <LanguageSelection toggle={open}/>
                    </div>
                </Toolbar>
            </AppBar>
            {isAdmin ? <Drawer variant="permanent" open={open} sx={{background: '#FFA500'}}>
                <DrawerHeader sx={{background: '#FFA500', height: 68.5, position: "static"}}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon/> : <ChevronLeftIcon/>}
                    </IconButton>
                </DrawerHeader>
                <Divider/>
                <List sx={{background: '#FFFFFF', marginTop: 1}}>
                    {links && links.map((link, index) => (
                        <div key={index}>
                            <ListItem button key={link} onClick={() => {
                                if (link.includes('schemas') && returnToDashboard) {
                                    returnToDashboard('Schemas');
                                } else if (link.includes('data') && setToggle) {
                                    setToggle('Users');
                                }
                            }}>
                                <ListItemIcon>{link.includes('schema') ? <AddIcon/> :
                                    <DataObjectIcon/>}</ListItemIcon>
                                <ListItemText primary={t(link).toUpperCase()}/>
                            </ListItem>
                            <Divider/>
                        </div>
                    ))}
                </List>
            </Drawer> : null}
        </Box>
    );
}
export default SideBar;

