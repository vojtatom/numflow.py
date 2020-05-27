# VIZ

Based on some [older code](https://github.com/vojtatom/numflow), written in Python/Cython/C++

Changes in `.cpp`, `.hpp`, `.pyx`, and `.pyd` requre recompilation of the numflow package, use attached makefile to do so (command `make python`), changes in `.py` files do not require compilation.
Before commiting, please run `make clean` to remove unnecesary build files, I tried to include them all in gitignore, but something hight have slipped through.


## TODO
 * udelat vetev
 * opravit bug s interpolací
 * dodelat integraci
 
Obecne GL
 * napsat opengl spousteni okna
 * kompilace shaderu VS + FS... toho je hodne
  * nacteni, kompilovani, linkovani... 
  * mechanismus pro ziskani atributu... nejak
  * co z toho -> nejaky objekt co representuje shader a muzu s nim nej pracovat abych mu mohl nastavovat atributy (attribs, uniforms...)

Glyphy
 * generovai geometrie glyphu
 * trida pro glyphy (obstara nahravani dat na gpu + kresleni) - buffer pozic, smeru a geometrie
 * napsat shader pro glyphy

Rezy 2D
 * generovani geometrie roviny
 * trida pro rez (obstara nahravani dat na gpu + kresleni) - buffer geometrie + pro kazdy vrchol rychlost (skalar)
 * napsat shader pro rez

Streamlines
 * TODO