# Automatisiertes Refactoring in JS
Dies ist ein Repository für ein Projekt im Rahmen einer Bachelor-Arbeit an der Universität Hamburg. Dabei werden mit dem Tool JSCodeShift verschiedene Refactorings vollautomatisch umgesetzt.

## Codemods Starten
### JSCodeshift normal

  cd .\TestProjects\MyTestProject
  
  jscodeshift .\src\funktion-inline-platzieren\funktion-inline-platzieren-input.js -t ..&#92;..&#92;Codemods\funktion-inline-platzieren.js

### JSCodeShift debug Mode

  cd .\TestProjects\MyTestProject 
  
  node --inspect-brk ..&#92;..&#92;node_modules&#92;jscodeshift\bin\jscodeshift.sh -t ..&#92;..&#92;Codemods\funktion-inline-platzieren.js --run-in-band .\src\funktion-inline-platzieren\funktion-inline-platzieren-input.js -d -p
