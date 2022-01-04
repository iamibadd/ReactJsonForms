import React from 'react';
import {Container, Typography} from "@material-ui/core";
import {useTranslation} from 'react-i18next';

const Page404 = () => {
    const {t} = useTranslation();
    return (
        <>
            <Container>
                <Typography variant="h4" color={'secondary'} style={{textAlign: "center"}}>{t('page404')}</Typography>
            </Container>
        </>
    );
};

export default Page404;
