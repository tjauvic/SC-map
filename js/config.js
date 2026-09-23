/* =========================================================
FILTER CONFIGURATION
========================================================= */
const FILTER_CONFIG = {

coringSummary: "Coring Summary",
coreSectionSummary: "Core/Section Summary",
siteMap: "Site Map",
bathymetry: "Bathymetry",
visualCoreDesc: "Visual Core Descriptions",
lithology: "Lithology",
seismicProfile: "Seismic Profile",
thinSections: "Thin Sections",
coreCloseups: "Core Closeups",
corePhotoImages: "Core Photo Images",
coreSections: "Core Sections",
chemRockEval: "Chemistry Rock Eval",
chemCarbonates: "Chemistry Carbonates",
chemGasElem: "Chemistry Gas Elements",
chemWaterSamples: "Chemistry Water Samples",
downHoleTemp: "Down Hole Temp",
magSusceptibility: "Magnetic Susceptibility",
magRemanence: "Magnetic Remanence",
xRay: "X-Ray",
gammaRay: "Gamma Ray",
heatFlow: "Heat Flow",
boreholePressure: "Borehole Pressure",
bulkDensity: "Bulk Density",
moistureDensity: "Moisture and Density",
pWaveVelocity: "P-wave Velocity",
shearStrength: "Shear Strength",
thermalConductivity: "Thermal Conductivity",
resistivity: "Resistivity",
icpAesSolids: "ICP-AES Solids",
reflectanceSpectroscopy: "Reflectance Spectroscopy",
smearSlides: "Smear Slides",
sulfurIsotopic: "Sulfur Isotopic Comp.",
traceElement: "Trace Element Conc.",
bottomWaterOxygen: "Bottom Water Oxygen",
seafloorPressure: "Seafloor/Borehole Pressure",
oceanCurrents: "Ocean Currents",
boreholeTemp: "Borehole Temp",
earthquakeCatalogue: "Earthquake Catalogue",
photomicrographs: "Photomicrographs",
pieceLog: "Piece Log",
corelog: "Corelog (Samples)",
cryomag: "Cryomag",
paleoInvestigation: "Paleo Investigation",
rangeTable: "Range Table",
ageProfile: "Age Profile",
depthAgeModel: "Depth-Age Model",
permeability: "Permeability"

};
/* =========================================================
MAP CONFIGURATION
========================================================= */

const MAP_CONFIG = {

center: [48.5, -127.0],

zoom: 8,

minZoom: 7,

maxZoom: 18,

worldCopyJump: false,

initialBounds: [
    [47.75, -129.35],
    [48.95, -125.97]
],

labelMinZoom: 9,

bathymetryOpacity: 0.30

};
/* =========================================================
DATA URLS
========================================================= */

const DATA_URLS = {

bathymetry:
    "https://tiles.arcgis.com/tiles/qRqOFxxnwUHOSocZ/arcgis/rest/services/CascadiaBasinBathymetry2/MapServer/tile/{z}/{y}/{x}"

};
