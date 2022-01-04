import * as React from 'react';
import {styled, alpha} from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import {useTranslation} from 'react-i18next';

const Search = styled('div')(({theme}) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    background: 'white',
    color: 'black',
    marginRight: 50,
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({theme}) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({theme}) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        [theme.breakpoints.up('sm')]: {
            width: '35ch',
        },
    },
}));

export default function SearchAppBar(props: any) {
    const {t} = useTranslation();
    const {search, schemas} = props;
    return (
        <Search>
            <SearchIconWrapper>
                <SearchIcon/>
            </SearchIconWrapper>
            <StyledInputBase
                placeholder={t('searchBy')}
                inputProps={{'aria-label': 'search'}}
                onChange={e => search(e.target.value)}
                disabled={schemas.length === 0}
            />
        </Search>
    );
}
