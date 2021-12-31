import React from 'react'
import {createTheme, CssBaseline, ThemeProvider} from '@material-ui/core';
import ReactDOM from 'react-dom';
import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import App from './App';

const theme = createTheme({
    overrides: {
        MuiFormControl: {
            root: {
                margin: '0.8em 0',
            },
        },
    },
});

i18next
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        supportedLngs: ['en', 'ar', 'fr'],
        fallbackLng: 'en',
        debug: false,
        // Options for language detector
        detection: {
            order: ['path', 'cookie', 'htmlTag'],
            caches: ['cookie'],
        },
        react: {useSuspense: false},
        backend: {
            loadPath: '/assets/locales/{{lng}}/translation.json',
        },
    });


ReactDOM.render(
    <ThemeProvider theme={theme}>
        <CssBaseline/>
        <App/>
    </ThemeProvider>,
    document.getElementById('root')
);
