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
		// $this->SetFont('sanchez', '', 6);
		$this->SetY(-10);
		$this->SetX($this->isOdd ? 5 : 100 - $this->getStringWidth($this->currentLeafPath));
		$this->Cell(0, 10, $this->currentLeafPath, 0, false, 'L', 0, '', 0, false, 'T', 'M');
		// $this->Cell(0, 10, $this->getAliasNumPage(), 0, false, 'C', 0, '', 0, false, 'T', 'M');
	}
}

function createContent($id, $path){
  global $aiBooksDir;
  global $aiData;
  global $edition_id;
  $edition_id = $id;

  $pdfFile = $aiBooksDir.'ArbreIntegral-'.$id.'.pdf';
  if (!file_exists($pdfFile)){
    $pdf = new AIPDF('P', 'mm', 'A6', true, 'UTF-8', false);

    // set document information
    $pdf->SetCreator(PDF_CREATOR);
    $pdf->SetAuthor('Donatien Garnier');
    $pdf->SetTitle("L'Arbre Intégral");

    $pdf->SetMargins(5, 10);
    $pdf->setFooterFont(Array('sanchez', '', 6));

    //First pages 
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);

    $pdf->AddPage();
    $pdf->SetFont('sanchez', '', 6);
    $pdf->setY(-30);
    $pdf->Write(0, "© Donatien Garnier", '', false, 'C', true, 0, false, false, 0);
    $pdf->Write(0, "www.arbre-integral.net", '', false, 'C', true, 0, false, false, 0);

    //main content
    $pdf->setPrintFooter(true);
    $leafs = explode('-', $path);
    $pdf->isOdd = false;
    foreach($leafs as $leafid){
      $pdf->AddPage();
      $pdf->isOdd = !$pdf->isOdd; 

      $leafpath = getLeafPath($leafid); 
      $content = $aiData->{$leafpath}->content;
      $cerneTxt = $aiData->{$leafpath}->name;

      //Display vertical cerne text
      $pdf->SetFont('sanchez', '', 7);
      $pdf->setY(10 + $pdf->getStringWidth($cerneTxt));
      $pdf->SetX($pdf->isOdd ? 5 : 95);
      $pdf->StartTransform();
      $pdf->Rotate(90);
      $pdf->Cell(0,0,$cerneTxt,0,0,'L',0,'');
      $pdf->StopTransform();

      //Display main text
      // $pdf->SetY(40);
      $pdf->SetFont('sanchez', '', 11);
      // $html = '<div style="line-height: 0.7cm;">'.str_replace('-', ' - ', $content).'</div>';
      $html = '<div style="line-height: 0.7cm;">'.$content.'</div>';
      $pdf->WriteHTMLCell(60, 15, 22, 35, $html,  0,  0,  false,  true, 'C', true);

      //Set infos for footer
      $pdf->currentLeafPath = $leafpath;
    } 

    //Close and output PDF document
    $pdf->Output($pdfFile, 'F');
  }
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

  $pdfFile = $aiBooksDir.'ArbreIntegral-'.$id.'-couverture.pdf';
  if (!file_exists($pdfFile)){
    $svgFile = $aiBooksDir.$id.'.svg';
    file_put_contents($svgFile, $svg);

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
    $pdf->SetFont('sanchez', '', 15);

    // add a page
    $pdf->AddPage();
    // $pdf->Cell(float w [, float h [, string txt [, mixed border [, int ln [, string align [, boolean fill [, mixed link]]]]]]])

    $pdf->SetFillColor(190,207,195);
    $pdf->Cell(0 , $docHeight / 2 , '', 0, 0, 'C', true);

    $pdf->SetY($docHeight / 2);
    $pdf->SetFillColor(0, 0, 0);
    $pdf->Cell(0 , $docHeight / 2 , '', 0, 0, 'C', true);

    $pdf->SetY(15);
    $pdf->SetFont('sanchez', 'I', 8);
    $pdf->Cell(0, 10, 'parcours '.$id, 0, false, 'C', 0, '', 0, false, 'T', 'M');

    // NOTE: Uncomment the following line to rasterize SVG image using the ImageMagick library.
    //$pdf->setRasterizeVectorImages(true);

    $svgSize = 90;
    $pdf->ImageSVG($svgFile, ($docWidth -$svgSize)/2, ($docHeight - $svgSize)/2, '', '', '', '', 1, false);

    // $pdf->SetFont('helvetica', '', 8);
    $pdf->SetTextColor(250,250,250);
    $pdf->SetY(120);
    $pdf->Write(0, 'L\'Arbre Intégral', '', 0, 'C', true, 0, false, false, 0);
    $pdf->SetFont('sanchez', '', 10);
    $pdf->Write(0, 'par Donatien Garnier', '', 0, 'C', true, 0, false, false, 0);

    // ---------------------------------------------------------

    //Close and output PDF document
    $pdf->Output($pdfFile, 'F');

  }
}
