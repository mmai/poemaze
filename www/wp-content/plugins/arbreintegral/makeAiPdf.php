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
		$this->SetFont('helvetica', 'I', 8);

		// Page number
		$this->Cell(0, 10, 'Page '.$this->getAliasNumPage().'/'.$this->getAliasNbPages(), 0, false, 'C', 0, '', 0, false, 'T', 'M');
	}
}

function createContent($id, $path){
  global $aiBooksDir;
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
  $pdf->SetMargins(0, 0, 0);
  $pdf->SetHeaderMargin(0);
  $pdf->SetFooterMargin(0);

  // set auto page breaks
  // $pdf->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM);

  // set image scale factor
  // $pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);

  // ---------------------------------------------------------

  // set font
  $pdf->SetFont('times', '', 15);

  $leafs = explode('-', $path);
  foreach($leafs as $leafid){
    // add a page
    $pdf->AddPage();

    $pdf->SetY(110);
    $pdf->Write(0, getLeafContent($leafid), '', 0, 'C', true, 0, false, false, 0);
  } 

  //Close and output PDF document
  $pdf->Output($aiBooksDir.'ArbreIntegral-'.$id.'.pdf', 'F');
}

function getLeafContent($leafid){
  global $aiData;

  $binary = decbin($leafid);
  $forks = str_split($binary);
  $forks[0] = 0;
  $leafpath = join('.', $forks);

  return $aiData->{$leafpath}->content;
}

/*******************************************
 * Cover 
 */

class AIPDFCover extends TCPDF {

	public function Header() {
	}

	// Page footer
	public function Footer() {
    global $edition_id;
		// Position at 15 mm from bottom
		$this->SetY(-15);
		// Set font
		$this->SetFont('helvetica', 'I', 8);
		$this->Cell(0, 10, 'Edition n° '.$edition_id, 0, false, 'C', 0, '', 0, false, 'T', 'M');

		// Page number
		// $this->Cell(0, 10, 'Page '.$this->getAliasNumPage().'/'.$this->getAliasNbPages(), 0, false, 'C', 0, '', 0, false, 'T', 'M');
	}
}

function createCover($id, $svg){
  global $aiBooksDir;
  global $edition_id;
  $edition_id = $id;

  file_put_contents($aiBooksDir.$id.'.svg', $svg);

  // create new PDF document
  $pdf = new AIPDFCover('P', 'mm', 'A6', true, 'UTF-8', false);

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
  $pdf->SetMargins(0, 0, 0);
  $pdf->SetHeaderMargin(0);
  $pdf->SetFooterMargin(0);

  // set auto page breaks
  // $pdf->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM);

  // set image scale factor
  // $pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);

  // ---------------------------------------------------------

  // set font
  $pdf->SetFont('times', '', 15);

  // add a page
  $pdf->AddPage();

  // NOTE: Uncomment the following line to rasterize SVG image using the ImageMagick library.
  //$pdf->setRasterizeVectorImages(true);

  $pdf->ImageSVG($file=$aiBooksDir.$id.'.svg', $x=5, $y=20, $w='', $h='', $align='', $palign='', $border=1, $fitonpage=false);

  // $pdf->SetFont('helvetica', '', 8);
  $pdf->SetY(110);
  $pdf->Write(0, 'L\'Arbre Intégral', '', 0, 'C', true, 0, false, false, 0);
  $pdf->SetFont('times', '', 10);
  $pdf->Write(0, 'par Donatien Garnier', '', 0, 'C', true, 0, false, false, 0);

  // ---------------------------------------------------------

  //Close and output PDF document
  $pdf->Output($aiBooksDir.'ArbreIntegral-'.$id.'-couverture.pdf', 'F');
}
