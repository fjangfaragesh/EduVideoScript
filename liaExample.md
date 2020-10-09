<!--
author:   Fabian Bär
email: baerfabian@gmx.de

version: 0.0.4

import: https://fjangfaragesh.github.io/EduVideoScript/import.md
-->

# Edu Video Script Lia Example

**Import:**

```
import: https://fjangfaragesh.github.io/EduVideoScript/import.md
```

**Usage:**

```
@EduVideoScript.eval(`PROGRAM`)
```
Replace `PROGRAM` by the program json text and replace `'` by `&apos;` and backtick/grave by `&grave;`

You can create the program [here](https://fjangfaragesh.github.io/EduVideoScript/editor/editor.html) and generate the makro code.

**Example:**

```
@EduVideoScript.eval(`[["say",{"text":"It&apos;s running on LiaScript!"}],["say",{"text":"Ciao!"}]]`)
```

@EduVideoScript.eval(`[["say",{"text":"It&apos;s running on LiaScript!"}],["say",{"text":"Ciao!"}]]`)
