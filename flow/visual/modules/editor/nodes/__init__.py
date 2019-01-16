from .data import DataNode
from .points import PointsNode
from .glyphs import GlyphsNode

nodes = {
        DataNode.title: DataNode,
        GlyphsNode.title: GlyphsNode,
        PointsNode.title: PointsNode,
    }