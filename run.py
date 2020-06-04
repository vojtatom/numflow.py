from numflow.application import Application 

if __name__ == "__main__":
    app = Application()
    #app.load_dataset("test2.csv")
    
    #faster loading
    app.load_dataset("el1.fits")
    #app.load_dataset("mag1_512_512_512.csv")

    region_low = [-1.5] * 3
    region_high = [1.5] * 3

    #app.add_glyphs(numSamples=10000, size=0.05, low=region_low, high=region_high)
    app.add_slice(0, axis="z", resolution=[1000, 1000], transparency=1.0, low=region_low, high=region_high)
    app.add_slice(0, axis="x", resolution=[1000, 1000], transparency=1.0, low=region_low, high=region_high)
    #app.add_streamline(0, 0.1, numSamples=1000, low=[-10, -10, 15], high=[10, 10, 15])
    #app.add_streamline(0, 100, numSamples=100, size=0.01, transparency=0.8, low=[-10, -10, 0], high=[10, 10, 0])
    #app.add_streamline(0, 100, numSamples=100, size=0.01, transparency=0.8, low=region_low, high=region_high)
    #app.add_streamline(0, 100, numSamples=100, size=0.01, transparency=0.8, low=[-10, -10, 1], high=[10, 10, 1])
    app.add_streamline(0, 10, numSamples=100, size=0.01, transparency=0.8, low=region_low, high=region_high)

    app.load_dataset("mag1.fits")
    app.add_streamline(0, 10, numSamples=10, size=0.03)
    app.add_streamline(0, 10, numSamples=100, size=0.03, low=region_low, high=region_high)
    
    app.run()

















