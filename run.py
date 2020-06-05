from numflow import Visualization 

vis = Visualization()
vis.load_dataset("test2.csv")
#vis.load_dataset("el1_512_512_512.csv")
#or
#vis.load_dataset("el1_512_512_512.npy")
#or
#vis.load_dataset("el1_512_512_512.fits")

#add semi-transparent glyphs in the overall dataset
vis.add_glyphs(numSamples=10000, size=0.1, transparency=0.2)

#add highres planes positioned at axis_coord=0
vis.add_slice(0, axis="x", resolution=[1000, 1000], transparency=1.0)
vis.add_slice(0, axis="y", resolution=[1000, 1000], transparency=1.0)
vis.add_slice(0, axis="z", resolution=[1000, 1000], transparency=1.0)

#add streamlines into a subregion of the dataset and mark the region with a box
region_low = [-1, -1, -3]
region_high = [1, 1, 3]

vis.add_box(region_low, region_high)
vis.add_streamline(0, 1000, numSamples=100, size=0.05, low=region_low, high=region_high)

#shows the constructed visualization
vis.display()