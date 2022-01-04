# JSON FORMS REACT APP

## Steps to run the application

1) Create a ``.env`` file in the root directory of the project. Inside ``.env`` file enter the following environment
   variables:

```
REACT_APP_BACKEND_API = BACKEND_API_URL
```

For example, if your ``BACKEND_API_URL`` is **http://localhost:5000**, you will type the following in .env file:

```
REACT_APP_BACKEND_API = http://localhost:5000
```

2) Run this command in the project terminal to install dependencies:

```
npm install
```

3) Run this command in the project terminal to start the application:

```
npm start
```

## Steps to add a new language for translation

1) Create a folder in `public/assets/locales/` and name it by `{language code}` of the language you want to add. For
   example the language code for English is ``en`` and German is ``de``.


2) Create a file `translation.json` inside that folder and paste the following object in it:

```
{
  "appTitle": "Title",
  "dashboard": "Dashboard",
  "userDashboard": "User Dashboard",
  "schemas": "Schemas",
  "schema": "Schema",
  "data": "Data",
  "createSchema": "Create Schema",
  "name": "Name",
  "description": "Description",
  "separator": "Separator",
  "active": "Active",
  "createdAt": "Created At",
  "actions": "Actions",
  "edit": "Edit",
  "delete": "Delete",
  "clear": "Clear",
  "back": "Back",
  "show": "Show",
  "hide": "Hide",
  "schemaName": "Schema Name",
  "formSubmitted": "Form submitted successfully!",
  "formUpdated": "Form updated successfully!",
  "editSchema": "Edit Schema",
  "schemaEditor": "Schema Editor",
  "preview": "Preview",
  "save": "Save",
  "update": "Update",
  "cancel": "Cancel",
  "searchBy": "Search by schema or description",
  "schemasUnavailable": "No schema available",
  "usersUnavailable": "No user available",
  "deleteWarning": "Are you sure you want to delete this schema?",
  "page404": "PAGE NOT FOUND 404",
  "useSchema": "Use Schema",
  "form": "Form",
  "activated": "activated",
  "deactivated": "deactivated"
}
```

3) Replace all the values with the translated words. For example, you can change ``appTitle: Title``
   to ``appTitle: Título`` (Title translation in Spanish is Título).


4) Open ``languages.json`` from ``src/utils/``, and add the following object at the end of it:

```
   {
    "code": "Language Code",
    "name": "Language Name"
    }
```

For example if your language is ``Spanish`` and your ``language code`` is ``es``, you will add the following object
inside ``languages.json`` file:

```
   {
    "code": "es",
    "name": "Spanish"
  }
```

### Happy Hacking!
