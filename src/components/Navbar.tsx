import React, {FC} from 'react';
import {Button, AppBar, Box, Toolbar, Container} from '@mui/material';


interface IProps {
    links: Array<any>
    setToggle?: (b: boolean) => void;
    setSchema?: (obj: any) => void;
}


const ResponsiveAppBar: FC<IProps> = ({setToggle, links, setSchema}: IProps) => {
    const setStage = (link: string) => {
        if (link === 'Dashboard') {
            if (setToggle) {
                setToggle(false);
            }
        } else if (link === 'Create Schema') {
            if (setToggle) {
                setToggle(true);
            }
        } else if (link === 'User Dashboard') {
            if (setSchema) {
                setSchema({properties: {}})
            }
        }
    }
    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar>
                    <Box sx={{display: 'flex'}}>
                        {links.map((link) => (
                            <Button key={link} sx={{my: 2, color: 'white', display: 'block'}}
                                    onClick={() => setStage(link)}
                            >
                                {link}
                            </Button>
                        ))}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};
export default ResponsiveAppBar;
