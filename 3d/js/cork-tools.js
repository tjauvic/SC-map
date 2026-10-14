/* =========================================================
TOOLS ON AND AROUND THE U1362A CORK

What is on the CORK wellhead at Hole U1362A (the Solid Carbon injection hole), and what is planned for it and
around it. Shown as pins in the 3D viewer's CORK 1362A model; clicking a pin opens a panel about the tool.

The descriptions are plain-language summaries for visitors.

Positions are in the CORK 1362A model's own metres: x east, z south (model north is -Z), y up. The model has
its wellhead standing on 31.5 m of pipe, so the seafloor is at y = 31.54 and the top of the wellhead disc is at
y = 34.13. The pins on the wellhead are placed on the face of the tower and the disc; those around it are
schematic, not surveyed.
========================================================= */

/* installed: it is there now.  planned: it is not installed yet.
   place: "cork" for tools on the wellhead, "nearby" for those on the seafloor around it.
   pos is where the pin sits, and normal is the direction it faces (which decides when it counts as hidden
   behind the model). image is optional: only the tools with a photo have one. */
const CORK_TOOLS = [
    {
        id: "cork-wellhead",
        name: "CORK wellhead",
        status: "installed", place: "cork",
        where: "Top of the tower",
        pos: [0, 38.04, 0.3],
        normal: [0, 0, 1],
        image: "https://lh3.googleusercontent.com/d/1OnOqrGZ1r1FviOdq9gf-75dIG0tcml_k",
        imageNote: "ONC photo of a CORK (not necessarily this one)",
        purpose: "A CORK seals the top of a drilled borehole so that pressure, temperature and fluid chemistry deep " +
                 "in the rock can be monitored.",
        link: { url: "https://wiki.oceannetworks.ca/display/instruments/CORK", text: "Learn more at ONC" },
    },
    {
        id: "pressure-logger",
        name: "Pressure logger (Bay A)",
        status: "installed", place: "cork",
        where: "Bay A, top of the panel",
        pos: [0.27, 36.64, 0.12],
        normal: [0.91, 0, 0.41],
        image: "tools/pressure-logger.jpg",
        purpose: "Records the pressure of the fluid in the rock at the bottom of the hole, which changes with tides, " +
                 "earthquakes and the injected fluid.",
    },
    {
        id: "pressure-gauges",
        name: "Pressure gauges and valves (Bay A)",
        status: "installed", place: "cork",
        where: "Bay A, below the logger",
        pos: [0.27, 35.74, 0.12],
        normal: [0.91, 0, 0.41],
        image: "tools/bay-a.jpg",
        purpose: "The gauges measure the fluid pressure in the hole, and the valves open and close the lines to the sensors.",
    },
    {
        id: "osmosampler-valves",
        name: "OsmoSampler valves (Bay B)",
        status: "installed", place: "cork",
        where: "Bay B, geochemistry sampling",
        pos: [-0.03, 36.04, -0.3],
        normal: [-0.1, 0, -0.99],
        image: "tools/bay-b.jpg",
        purpose: "Valves that connect OsmoSamplers to fluid-sampling tubes whose inlets are in the basement rock at " +
                 "the bottom of the hole.",
    },
    {
        id: "microbiology-valves",
        name: "Microbiology valves (Bay C)",
        status: "installed", place: "cork",
        where: "Bay C, flowmeter and microbiology",
        pos: [-0.24, 36.04, 0.18],
        normal: [-0.81, 0, 0.59],
        image: "tools/bay-c.jpg",
        purpose: "Valves for taking fluid samples for microbiology. This bay also holds the flowmeter, and is where " +
                 "the planned CO2 injection pump connects.",
    },
    {
        id: "temporary-ctd",
        name: "Temporary CTD and oxygen sensor (ONC)",
        status: "installed", place: "nearby",
        where: "About 10 m north-east of the CORK",
        pos: [5.6, 32.54, -8.3],
        normal: [0, 1, 0],
        image: "https://lh3.googleusercontent.com/d/1XuMKjzgY68x2k-rIdU00fi211dUiWncf",
        imageNote: "ONC photo of a Sea-Bird CTD",
        purpose: "Measures the temperature, salinity and dissolved oxygen of the water just above the seafloor.",
    },
    {
        id: "osmosampler",
        name: "OsmoSampler",
        status: "planned", place: "cork",
        where: "CORK top plate, beside Bay B",
        pos: [0.69, 34.28, -0.85],
        normal: [0, 1, 0],
        purpose: "Collects small samples of the fluid in the borehole over time, to be analysed after it is recovered.",
    },
    {
        id: "ferry-box",
        name: "“Ferry Box”: CTD, carbon meter and fluorometer",
        status: "planned", place: "cork",
        where: "CORK top plate, beside Bay B",
        pos: [-0.85, 34.28, -0.69],
        normal: [0, 1, 0],
        purpose: "A sensor package that measures the chemistry of the fluid from the borehole: a fluorometer, a " +
                 "“carbon” meter and a resistivity meter (CTD).",
    },
    {
        id: "camera",
        name: "Camera with pan and tilt",
        status: "planned", place: "nearby",
        where: "West-south-west of the CORK, near the pump",
        pos: [-7, 32.54, 3],
        normal: [0, 1, 0],
        purpose: "Lets scientists watch the injection pump and the CORK remotely, and look around by panning and tilting.",
    },
    {
        id: "pump",
        name: "CO2 injection pump",
        status: "planned", place: "nearby",
        where: "South-west of the CORK, in view of the camera",
        pos: [-4, 32.54, 6],
        normal: [0, 1, 0],
        purpose: "Pumps the fluid to be injected down the hole. The favoured route is the “lateral” connection in Bay C.",
    },
    {
        id: "sonar",
        name: "Sonar",
        status: "planned", place: "nearby",
        where: "20–30 m north-west of the CORK",
        pos: [-18, 32.54, -18],
        normal: [0, 1, 0],
        purpose: "Images the area around the CORK, for example to spot fluid or gas escaping from the seafloor." ,
    },
    {
        id: "hydrophones",
        name: "Hydrophone array (4 high-frequency)",
        status: "planned", place: "nearby",
        where: "South-east of the CORK, 3–5 m from Bay A",
        pos: [4.5, 32.54, 2.5],
        normal: [0, 1, 0],
        purpose: "Four hydrophones (underwater microphones) that listen to high-frequency sound around the site.",
    },
    {
        id: "mini-jb",
        name: "Mini junction box",
        status: "planned", place: "nearby",
        where: "About 15–20 m north-east of the CORK",
        pos: [12, 32.54, -12],
        normal: [0, 1, 0],
        purpose: "Passes power and communications from the cable to the new instruments, and on to the instrument " +
                 "platform at Hole 1026B.",
    },
];
