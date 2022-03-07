# Automatisiertes Refactoring in JS
Dies ist ein Repo für ein Projekt im Rahmen einer Bachelor-Arbeit an der Universität Hamburg. Dabei werden mit dem Tool JSCodeShift verschiedene Refactorings vollautomatisch umgesetzt.

## Codemods Starten
### JSCodeshift normal

jscodeshift .\TestProjects\MyTestProject\funktion-inline-platzieren-input.js -t .\Codemods\funktion-inline-platzieren.js

### JSCodeShift debug Mode

node --inspect-brk .\node_modules\jscodeshift\bin\jscodeshift.sh -t .\Codemods\funktion-inline-platzieren.js --run-in-band .\TestProjects\MyTestProject\funktion-inline-platzieren-input.js
-d -p
