#!/bin/bash

cd "$(dirname "$0")"

BUILD_DIR="./visual/static/visual/build"

OUTPUT_WEB="./visual/static/visual/build/web.js"
OUTPUT_SAGE="../sage/flowapp/scripts/scripts.js"
SAGEDIR="../sage/"

OUTPUT_TMP="./visual/static/visual/build/tmp.js"
CANVAS_ROOT="./visual/static/visual/canvas/js"
PORTAL_ROOT="./visual/static/visual/portal/js"


read -r -d '' EXTERNALSLIST << EOM
./visual/static/visual/portal/js/externals/cookies.js
./visual/static/visual/portal/js/externals/websocket.js
./visual/static/visual/portal/js/externals/uuid.js
./visual/static/visual/canvas/js/externals/gl-matrix.js
EOM


read -r -d '' PORTALLIST << EOM
./visual/static/visual/portal/js/history.js
./visual/static/visual/portal/js/datamanager.js
./visual/static/visual/portal/js/editor.js
./visual/static/visual/portal/js/terminal.js
./visual/static/visual/portal/js/ui/subui/ui_notebook_form.js
./visual/static/visual/portal/js/ui/subui/ui_notebook_open.js
./visual/static/visual/portal/js/ui/subui/ui_file_edit.js
./visual/static/visual/portal/js/ui/subui/ui_file_delete.js
./visual/static/visual/portal/js/ui/subui/ui_dataset_copy.js
./visual/static/visual/portal/js/ui/subui/ui_general.js
./visual/static/visual/portal/js/ui/subui/ui_command.js
./visual/static/visual/portal/js/ui/ui_file.js
./visual/static/visual/portal/js/ui/ui_sidebar.js
./visual/static/visual/portal/js/ui/ui_dataset.js
./visual/static/visual/portal/js/ui/ui_notebook.js
./visual/static/visual/portal/js/ui/ui_terminal.js
./visual/static/visual/portal/js/ui/ui_header.js
./visual/static/visual/portal/js/ui/ui_connection.js
./visual/static/visual/portal/js/ui/ui_node.js
./visual/static/visual/portal/js/ui/ui_editor.js
./visual/static/visual/portal/js/ui.js
EOM

read -r -d '' CANVASLIST << EOM
./visual/static/visual/canvas/js/graphics/shaders/base/shader_type.js
./visual/static/visual/canvas/js/graphics/shaders/base/shader.js
./visual/static/visual/canvas/js/graphics/shaders/base/program.js
./visual/static/visual/canvas/js/graphics/shaders/box_program.js
./visual/static/visual/canvas/js/graphics/shaders/glyph_program.js
./visual/static/visual/canvas/js/graphics/shaders/stream_program.js
./visual/static/visual/canvas/js/graphics/shaders/text_program.js
./visual/static/visual/canvas/js/graphics/shaders/layer_program.js
./visual/static/visual/canvas/js/graphics/primitives/geometry.js
./visual/static/visual/canvas/js/graphics/primitives/primitive.js
./visual/static/visual/canvas/js/graphics/primitives/unit_box.js
./visual/static/visual/canvas/js/graphics/primitives/stream.js
./visual/static/visual/canvas/js/graphics/primitives/box.js
./visual/static/visual/canvas/js/graphics/primitives/glyphs.js
./visual/static/visual/canvas/js/graphics/primitives/quad.js
./visual/static/visual/canvas/js/graphics/primitives/layer.js
./visual/static/visual/canvas/js/graphics/scenes/light.js
./visual/static/visual/canvas/js/graphics/scenes/camera.js
./visual/static/visual/canvas/js/graphics/scenes/scene.js
./visual/static/visual/canvas/js/graphics/graphics.js
./visual/static/visual/canvas/js/interface/interface.js
./visual/static/visual/canvas/js/math.js
./visual/static/visual/canvas/js/ui/ui_fields.js
./visual/static/visual/canvas/js/ui/ui_widget.js
./visual/static/visual/canvas/js/ui/ui_scene.js
./visual/static/visual/canvas/js/ui.js
./visual/static/visual/canvas/js/flowapp.js
./visual/static/visual/canvas/js/webapp.js 
EOM

read -r -d '' SHADERSLIST << EOM
./visual/static/visual/canvas/js/graphics/shaders/src/box_fs.glsl
./visual/static/visual/canvas/js/graphics/shaders/src/box_vs.glsl
./visual/static/visual/canvas/js/graphics/shaders/src/glyph_fs.glsl
./visual/static/visual/canvas/js/graphics/shaders/src/glyph_vs.glsl
./visual/static/visual/canvas/js/graphics/shaders/src/layer_fs.glsl
./visual/static/visual/canvas/js/graphics/shaders/src/layer_vs.glsl
./visual/static/visual/canvas/js/graphics/shaders/src/stream_fs.glsl
./visual/static/visual/canvas/js/graphics/shaders/src/stream_vs.glsl
./visual/static/visual/canvas/js/graphics/shaders/src/text_fs.glsl
./visual/static/visual/canvas/js/graphics/shaders/src/text_vs.glsl
EOM


if [ ! -d "$BUILD_DIR" ]; then
    mkdir "$BUILD_DIR"
fi

### BUILD WEB APP
touch $OUTPUT_TMP
echo "'use strict';" > $OUTPUT_WEB

#echo "$EXTERNALSLIST" | xargs cat >> $OUTPUT_TMP
echo "$PORTALLIST" | xargs cat >> $OUTPUT_TMP

##exclude form grep using \|
echo "$CANVASLIST" | grep -v 'webapp.js' | xargs cat >> $OUTPUT_TMP

sed "s/'use strict';/ /g" $OUTPUT_TMP >> $OUTPUT_WEB

#echo "uglifying web app..."
### minify later...
#uglifyjs --compress --mangle -- $OUTPUT_WEB
rm $OUTPUT_TMP


### BUILD SAGE APP
touch $OUTPUT_TMP
echo "'use strict';" > $OUTPUT_SAGE

#echo "$EXTERNALSLIST" | xargs cat >> $OUTPUT_TMP
echo "$PORTALLIST" | grep 'datamanager.js' | xargs cat >> $OUTPUT_TMP

##exclude form grep using \|
echo "$CANVASLIST" | grep -v 'webapp.js' | xargs cat >> $OUTPUT_TMP

sed "s/'use strict';/ /g" $OUTPUT_TMP >> $OUTPUT_SAGE

#echo "uglifying sage app..."
### minify later...
#uglifyjs --compress --mangle -- $OUTPUT_SAGE
rm $OUTPUT_TMP


echo "$EXTERNALSLIST" | xargs cp -ut "../sage/flowapp/scripts/"
echo "$SHADERSLIST" | xargs cp -ut "../sage/flowapp/shaders/"

cd $SAGEDIR
zip -r flowapp.zip flowapp