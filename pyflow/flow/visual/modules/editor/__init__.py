from .nodes import *

nodes_structure = {
            'data': { 
                DataNode.title : DataNode.data,
                PointsNode.title : PointsNode.data,
                PlaneNode.title : PlaneNode.data
             },

            'geometry': { 
                GlyphsNode.title : GlyphsNode.data,
                StreamlinesNode.title : StreamlinesNode.data,
                LayerNode.title: LayerNode.data,
             },

            'modifications': {
                ScaleNode.title : ScaleNode.data,
                TranslateNode.title : TranslateNode.data,
                ColorNode.title: ColorNode.data,
                GlyphGeometryNode.title: GlyphGeometryNode.data,
                StreamGeometryNode.title: StreamGeometryNode.data,
            },

             'display': {
                 VisualNode.title : VisualNode.data
             }

        }