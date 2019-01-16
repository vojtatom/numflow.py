from .nodes import DataNode, PointsNode, GlyphsNode

nodes_structure = {
            'data': { 
                DataNode.title : DataNode.data
             },

            'geometry': { 
                PointsNode.title : PointsNode.data,
                GlyphsNode.title : GlyphsNode.data
             }

        }