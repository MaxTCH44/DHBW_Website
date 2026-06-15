# Content & Data Editing Guide for GreenLab H2 Calculator

Welcome! This guide is designed to help researchers and non-developers update the platform's content, scientific data, and translations safely, without needing to edit any React code. 

All application data is stored in standard JSON files. By following these rules, you can update the tool's parameters autonomously.

## 1. Golden Rules for Editing JSON Files
JSON is a very strict data format. A single missing quote or extra comma can crash the application. Always follow these rules:
- **No Trailing Commas**: The last item in a list (array) or an object must NEVER have a comma after it.
- **Double Quotes Only**: All text strings and properties must be wrapped in double quotes (`"text"`), never single quotes (`'text'`).
- **Preserve Data Types**: If a value is a number (e.g., `34727.54`), do NOT wrap it in quotes. If it's a list (`[...]`), maintain the brackets.
- **Validate Before Saving**: Always use a free online JSON validator or a code editor to spot syntax errors before saving your files.

## 2. Editing Interface Texts (i18n Translations)
GreenLab H2 Calculator is a multi-language application. Text displayed on the screen is not hardcoded. Instead, we use translation folders.

To fix a typo, update a definition, or modify the phrasing of the user interface:
1. Navigate to the translation folders: `src/i18n/locales/en/` for English, `src/i18n/locales/de/` for Deutsch, etc.
2. Open the relevant file (for example, `src/i18n/locales/de/home.json` or `calculator.json`).
3. Locate the corresponding key and edit the text on the right side of the colon.

## 3. Modifying Scientific & Mathematical Data
Scientific data (prices, technical limits, consumptions) is stored directly in the `src/data/` folder. 

For instance, to update the financial or physical specs of an electrolyzer, open `src/data/calculator/electrolyzers_list.json`. Here is a real excerpt from the AEM electrolyzer:

```json
{
    "id" : 1,
    "name" : "electrolyzer.electrolyzers.aem.name",
    "type" : "electrolyzer.type.aem",
    "price" : 34727.54,
    "stack_price" : 9600,
    "max_stacks" : 4,
    "power" : 2.4,
    "stack_power" : 2.4,
    "energy_consumption_kwh_per_kg" : 53.4,
    "total_auxiliary_consumption" : 0.5,
    "water_consumption_l_per_h" : 1.26,
    "maintenance_percent_capex" : 5,
    "stack_lifetime_hours" : 35000
}
```

If a manufacturer updates their pricing or efficiency, simply update the raw numbers. For example, change `"price" : 34727.54` to `"price" : 35000`, or update `"energy_consumption_kwh_per_kg" : 53.4` to `"energy_consumption_kwh_per_kg" : 50.0`. 

## 4. CRUCIAL EXPLANATION: Translation Keys vs. Raw Data
This is the most common mistake made when editing the content! Look closely at the JSON block above.

You will notice that text fields like `name` or `type` do not contain actual readable text. Instead, they contain paths like `"electrolyzer.electrolyzers.aem.name"`.

**These are translation keys (i18n), NOT standard text fields!**

This pattern applies everywhere in `src/data/` (for example, the `description` fields in `src/data/home_learn.json` or the `title` and `value` fields in `src/data/calculator/calculator_advices.json`).

**How to read this:**
- `"stack_price": 9600` -> This is a direct mathematical value. Edit it right here in the data file.
- `"name": "electrolyzer.electrolyzers.aem.name"` -> This is a reference pointing to the translation folder.

**Rule of Thumb:**
If you want to rename the AEM electrolyzer on the interface:
- ❌ **DO NOT** replace the key in `src/data/calculator/electrolyzers_list.json` (e.g., `"name": "My New AEM"`). This will break the multi-language system, and the application will literally display "My New AEM" for French, German, and English users without translating it.
- ✅ **DO** leave `"name": "electrolyzer.electrolyzers.aem.name"` exactly as it is in the data file. Instead, go to the translation files in `src/i18n/locales/` and update the text associated with that specific key there.