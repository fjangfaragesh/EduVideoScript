<!--
author:   Fabian Bär
email: baerfabian@gmx.de

version: 0.0.1

@EduVideoScript.eval

<iframe
  src= https://fjangfaragesh.github.io/EduVideoScript/evs.html
  style="border:1px solid black"
  width="500"
  height="500"
  onload='this.contentWindow.postMessage(JSON.stringify({"command":"loadCode","code":@0}),"*")'>
</iframe>

@end

-->

# EduVideoScript Import

[Example](https://liascript.github.io/course/?https://fjangfaragesh.github.io/EduVideoScript/liaExample.md)

```
@EduVideoScript.eval(`[["say",{"text":"Welcome LiaScript!"}],["say",{"text":"Ciao!"}]]`)
```
@EduVideoScript.eval(`[["say",{"text":"Welcome LiaScript!"}],["say",{"text":"Ciao!"}]]`)
