<?php
//============================================================+
// File name   : ai.php
//
// Description : Example Arbre Integral for TCPDF class
//               SVG Image
//
// Author: Henri Bourcereau
//
//============================================================+

// Include the main TCPDF library 
require_once(dirname(__FILE__).'/vendor/tcpdf/tcpdf.php');
$aiBooksDir = realpath(dirname(__FILE__).'/../../../aibooks/')."/";

$aiData = json_decode(file_get_contents(dirname(__FILE__).'/../../arbreintegral.json'));

$edition_id = "?";

/**
 * content 
 */

class AIPDF extends TCPDF {

	public function Header() {
	}

	// Page footer
	public function Footer() {
    global $edition_id;
		// Position at 15 mm from bottom
		$this->SetY(-10);
		// Set font
		$this->SetFont('freeserif', '', 8);

		// Page number
		$this->Cell(0, 10, $this->getAliasNumPage(), 0, false, 'C', 0, '', 0, false, 'T', 'M');
	}
}

function createContent($id, $path){
  global $aiBooksDir;
  global $aiData;
  global $edition_id;
  $edition_id = $id;

  file_put_contents($aiBooksDir.$id.'.svg', $svg);

  // create new PDF document
  $pdf = new AIPDF('P', 'mm', 'A6', true, 'UTF-8', false);

  // set document information
  $pdf->SetCreator(PDF_CREATOR);
  $pdf->SetAuthor('Donatien Garnier');
  $pdf->SetTitle("L'Arbre Intégral");

// remove default header/footer
  $pdf->setPrintHeader(false);
// $pdf->setPrintFooter(false);

  // set header and footer fonts
  // $pdf->setHeaderFont(Array(PDF_FONT_NAME_MAIN, '', PDF_FONT_SIZE_MAIN));
  $pdf->setFooterFont(Array(PDF_FONT_NAME_DATA, '', PDF_FONT_SIZE_DATA));

  // set default monospaced font
  $pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);

  // set margins
  $pdf->SetMargins(10, 10);


  // set auto page breaks
  // $pdf->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM);

  // set image scale factor
  // $pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);

  // ---------------------------------------------------------

  // set font
  $pdf->SetFont('dejavuserif', '', 15);

  $leafs = explode('-', $path);
  foreach($leafs as $leafid){
    $leafpath = getLeafPath($leafid); 
    $content = $aiData->{$leafpath}->content;

    // left page
    $pdf->AddPage();
    $pdf->SetY(50);
    $pdf->Write(0, $leafpath, '', 0, 'C', true, 0, false, false, 0);

    // right page
    $pdf->AddPage();
    $pdf->SetY(50);
    // $pdf->WriteHTML($html=$content, $align='C');
    $pdf->WriteHTML($content,  false,  false,  false,  false, 'C');
  } 

  //Close and output PDF document
  $pdf->Output($aiBooksDir.'ArbreIntegral-'.$id.'.pdf', 'F');
}

function getLeafPath($leafid){
  $binary = decbin($leafid);
  $forks = str_split($binary);
  $forks[0] = 0;
  return join('.', $forks);
}

/*******************************************
 * Cover 
 */

function createCover($id, $svg){
  global $aiBooksDir;

  file_put_contents($aiBooksDir.$id.'.svg', $svg);

  // create new PDF document
  $pdf = new TCPDF('P', 'mm', 'A6', true, 'UTF-8', false);
  $docHeight = 148;
  $docWidth = 104;

  // set document information
  $pdf->SetCreator(PDF_CREATOR);
  $pdf->SetAuthor('Donatien Garnier');
  $pdf->SetTitle("L'Arbre Intégral");

// remove default header/footer
  $pdf->setPrintHeader(false);
  $pdf->setPrintFooter(false);

  // set margins
  $pdf->SetMargins(0, 0, 0);
  $pdf->SetHeaderMargin(0);
  $pdf->SetFooterMargin(0);

  //Remove bottom margin (!)
  $pdf->SetAutoPageBreak(TRUE, 0);

  // set font
  $pdf->SetFont('dejavuserif', '', 15);

  // add a page
  $pdf->AddPage();
  // $pdf->Cell(float w [, float h [, string txt [, mixed border [, int ln [, string align [, boolean fill [, mixed link]]]]]]])

  $pdf->SetFillColor(190,207,195);
  $pdf->Cell(0 , $docHeight / 2 , '', 0, 0, 'C', true);

  $pdf->SetY($docHeight / 2);
  $pdf->SetFillColor(0, 0, 0);
  $pdf->Cell(0 , $docHeight / 2 , '', 0, 0, 'C', true);

  $pdf->SetY(15);
  $pdf->SetFont('helvetica', 'I', 8);
  $pdf->Cell(0, 10, 'parcours '.$id, 0, false, 'C', 0, '', 0, false, 'T', 'M');

  // NOTE: Uncomment the following line to rasterize SVG image using the ImageMagick library.
  //$pdf->setRasterizeVectorImages(true);

  $svgSize = 90;
  $pdf->ImageSVG($aiBooksDir.$id.'.svg', ($docWidth -$svgSize)/2, ($docHeight - $svgSize)/2, '', '', '', '', 1, false);

  // $pdf->SetFont('helvetica', '', 8);
  $pdf->SetTextColor(250,250,250);
  $pdf->SetY(120);
  $pdf->Write(0, 'L\'Arbre Intégral', '', 0, 'C', true, 0, false, false, 0);
  $pdf->SetFont('times', '', 10);
  $pdf->Write(0, 'par Donatien Garnier', '', 0, 'C', true, 0, false, false, 0);

  // ---------------------------------------------------------

  //Close and output PDF document
  $pdf->Output($aiBooksDir.'ArbreIntegral-'.$id.'-couverture.pdf', 'F');
}
