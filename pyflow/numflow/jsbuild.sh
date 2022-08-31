#!/bin/bash

cd "$(dirname "$0")"

BUILD_DIR="./numflow/renderer/interface/build"

OUTPUT_WEB="$BUILD_DIR/web.js"
OUTPUT_TMP="$BUILD_DIR/tmp.js"

read -r -d '' CANVASLIST << EOM
./numflow/renderer/interface/js/datamanager.js
./numflow/renderer/interface/js/graphics/shaders/base/shader_type.js
./numflow/renderer/interface/js/graphics/shaders/base/shader.js
./numflow/renderer/interface/js/graphics/shaders/base/program.js
./numflow/renderer/interface/js/graphics/shaders/base/methodprogram.js
./numflow/renderer/interface/js/graphics/shaders/box_program.js
./numflow/renderer/interface/js/graphics/shaders/glyph_program.js
./numflow/renderer/interface/js/graphics/shaders/stream_program.js
./numflow/renderer/interface/js/graphics/shaders/text_program.js
./numflow/renderer/interface/js/graphics/shaders/layer_program.js
./numflow/renderer/interface/js/graphics/shaders/colorbar_program.js
./numflow/renderer/interface/js/graphics/primitives/classes.js
./numflow/renderer/interface/js/graphics/primitives/geometry.js
./numflow/renderer/interface/js/graphics/primitives/primitive.js
./numflow/renderer/interface/js/graphics/primitives/methodprimitive.js
./numflow/renderer/interface/js/graphics/primitives/unit_box.js
./numflow/renderer/interface/js/graphics/primitives/stream.js
./numflow/renderer/interface/js/graphics/primitives/box.js
./numflow/renderer/interface/js/graphics/primitives/glyphs.js
./numflow/renderer/interface/js/graphics/primitives/quad.js
./numflow/renderer/interface/js/graphics/primitives/layer.js
./numflow/renderer/interface/js/graphics/primitives/colorbar.js
./numflow/renderer/interface/js/graphics/scenes/light.js
./numflow/renderer/interface/js/graphics/scenes/camera.js
./numflow/renderer/interface/js/graphics/scenes/scene.js
./numflow/renderer/interface/js/graphics/graphics.js
./numflow/renderer/interface/js/interface.js
./numflow/renderer/interface/js/math.js
./numflow/renderer/interface/js/ui/ui_base.js
./numflow/renderer/interface/js/ui/ui_fields.js
./numflow/renderer/interface/js/ui/ui_widget.js
./numflow/renderer/interface/js/ui/ui_scene.js
./numflow/renderer/interface/js/ui/ui_component.js
./numflow/renderer/interface/js/ui.js
./numflow/renderer/interface/js/flowapp.js
./numflow/renderer/interface/js/webapp.js 
EOM

read -r -d '' SHADERSLIST << EOM
./numflow/renderer/js/interface/graphics/shaders/src/box_fs.glsl
./numflow/renderer/js/interface/graphics/shaders/src/box_vs.glsl
./numflow/renderer/js/interface/graphics/shaders/src/glyph_fs.glsl
./numflow/renderer/js/interface/graphics/shaders/src/glyph_vs.glsl
./numflow/renderer/js/interface/graphics/shaders/src/layer_fs.glsl
./numflow/renderer/js/interface/graphics/shaders/src/layer_vs.glsl
./numflow/renderer/js/interface/graphics/shaders/src/stream_fs.glsl
./numflow/renderer/js/interface/graphics/shaders/src/stream_vs.glsl
./numflow/renderer/js/interface/graphics/shaders/src/text_fs.glsl
./numflow/renderer/js/interface/graphics/shaders/src/text_vs.glsl
./numflow/renderer/js/interface/graphics/shaders/src/colorbar_fs.glsl
./numflow/renderer/js/interface/graphics/shaders/src/colorbar_vs.glsl
EOM

if [ ! -d "$BUILD_DIR" ]; then
    mkdir "$BUILD_DIR"
fi

### BUILD WEB APP
touch $OUTPUT_TMP
echo "'use strict';" > $OUTPUT_WEB

##exclude form grep using \|
echo "$CANVASLIST" | grep -v 'webapp.js' | xargs cat >> $OUTPUT_TMP

sed "s/'use strict';/ /g" $OUTPUT_TMP >> $OUTPUT_WEB

rm $OUTPUT_TMP