from numflow.application import Application 
import numpy as np

if __name__ == "__main__":
    app = Application()
    #app.load_dataset("test2.csv")
    
    #faster loading
    app.load_dataset("el3.fits")
    #app.load_dataset("el3_512_512_512.csv")
    #app.load_dataset("mag3_512_512_512.csv")
    #app.load_dataset("mag3.fits")

    zero_point = np.array([0.723, -1.117, -0.97])
    #region_low = zero_point - ([0.1] * 3)
    region_low = zero_point - ([10, 10, 0])
    #region_high = zero_point + ([0.1] * 3)
    region_high = zero_point + ([10, 10, 0])
    #region_low = None
    #region_high = None

    #app.add_glyphs(numSamples=10000, size=0.005, transparency=0.05)
    app.add_streamline(0, 10, numSamples=100, size=0.005, transparency=1.0, low=region_low, high=region_high)
    #app.add_streamline(0, 100, numSamples=100, size=0.01, transparency=0.8, low=region_low, high=region_high)
    #app.add_streamline(0, 100, numSamples=1000, size=0.001, transparency=0.3, low=region_low, high=region_high)
    #app.add_streamline(0, 10, numSamples=100, size=0.01, transparency=0.8, low=region_low, high=region_high)
    
    app.load_dataset("mag3.fits")
    #app.add_slice(0.723, axis="x", resolution=[1000, 1000],  transparency=1.0)
    #app.add_slice(-1.117, axis="y", resolution=[1000, 1000], transparency=1.0)
    app.add_slice(-0.97, axis="z", resolution=[1000, 1000],  transparency=1.0)
    app.add_box(region_low, region_high)
    #app.add_slice(0, axis="z", resolution=[1000, 1000], transparency=1.0)
    #app.add_slice(0, axis="y", resolution=[1000, 1000], transparency=1.0)
    #app.add_streamline(0, 10000, numSamples=100, size=0.05, low=region_low, high=region_high)
    app.add_streamline(0, 10, numSamples=100, size=0.002, low=region_low, high=region_high)
    #app.add_streamline(0, 10, numSamples=100, size=0.03, low=region_low, high=region_high)
    
    app.run()

















