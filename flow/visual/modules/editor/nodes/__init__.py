from .data import DataNode
from .points import PointsNode
from .glyphs import GlyphsNode
from .streamlines import StreamlinesNode
from .visual import VisualNode

nodes = {
        DataNode.title: DataNode,
        GlyphsNode.title: GlyphsNode,
        PointsNode.title: PointsNode,
        StreamlinesNode.title: StreamlinesNode,
        VisualNode.title: VisualNode
    }