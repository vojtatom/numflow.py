from .data import DataNode
from .points import PointsNode
from .glyphs import GlyphsNode
from .streamlines import StreamlinesNode
from .visual import VisualNode
from .scale import ScaleNode
from .translate import TranslateNode
from .color import ColorNode
from .layer import LayerNode
from .plane import PlaneNode
from .glyphgeometry import GlyphGeometryNode
from .streamgeometry import StreamGeometryNode


nodes = {
        DataNode.title: DataNode,
        GlyphsNode.title: GlyphsNode,
        PointsNode.title: PointsNode,
        StreamlinesNode.title: StreamlinesNode,
        VisualNode.title: VisualNode,
        ScaleNode.title: ScaleNode,
        TranslateNode.title: TranslateNode,
        ColorNode.title: ColorNode,
        LayerNode.title: LayerNode,
        PlaneNode.title: PlaneNode,
        GlyphGeometryNode.title: GlyphGeometryNode,
        StreamGeometryNode.title: StreamGeometryNode,
    }