//Styles for the visualizations

export const svgStyle = {
    width: 480, height: 480,
    leafRadius: 3, circleRadius: 30,
    color_background: "whitesmoke",
    color_up: "rgb(72,122,189)",
    color_down: "rgb(128,120,48)",
    color_brothers: "#BBBBBB",
    color_default: "black",
    color_skeleton: "#DFDFDF",
  }

export const pdfStyle = { ...svgStyle,
      fixedSize: '90mm',
      leafRadius: 2,
      displayNeighbors:false
    }

export const logoStyle = { ...svgStyle,
      width: 120, height: 120,
      leafRadius: 1, circleRadius: 8,
      color_background: "black",
      displayNeighbors:false
    }
