from .nodes import DataNode, PointsNode, GlyphsNode, StreamlinesNode, VisualNode

nodes_structure = {
            'data': { 
                DataNode.title : DataNode.data
             },

            'geometry': { 
                PointsNode.title : PointsNode.data,
                GlyphsNode.title : GlyphsNode.data,
                StreamlinesNode.title : StreamlinesNode.data,
             },

             'display': {
                 VisualNode.title : VisualNode.data
             }

        }