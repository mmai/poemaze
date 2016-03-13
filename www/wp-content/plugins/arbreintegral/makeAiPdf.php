<?php
require_once(dirname(__FILE__).'/vendor/tcpdf/tcpdf.php');
$aiBooksDir = realpath(dirname(__FILE__).'/../../../aibooks/')."/";
$aiBooksSrc = realpath(dirname(__FILE__))."/";
$aiData = json_decode(file_get_contents(dirname(__FILE__).'/../../arbreintegral.json'));
$edition_id = "?";

class AIPDF extends TCPDF {
	public function Header() {}
	public function Footer() {
		$this->SetY(-10);
		$this->SetX($this->isOdd ? 5 : 100 - $this->getStringWidth($this->currentLeafPath));
		$this->Cell(0, 10, $this->currentLeafPath, 0, false, 'L', 0, '', 0, false, 'T', 'M');
	}
}

function createContent($id, $path, $visitorId){
  global $aiBooksDir;
  global $aiBooksSrc;
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

    //======== First pages 
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);

    //Page blanche
    $pdf->AddPage();

    //Page blanche
    $pdf->AddPage();

    //Faux titre
    $pdf->AddPage();
    $pdf->ImageSVG($aiBooksSrc."ai_typo_arbre.svg", 37, 20, '', 8, '', '', 1, false);
    $pdf->ImageSVG($aiBooksSrc."ai_typo_integral.svg", 37, 30, '', 8, '', '', 1, false);

    //Page blanche avec copyright
    $pdf->AddPage();
    $pdf->SetFont('sanchez', '', 6);
    $pdf->setY(-30);
    $pdf->Write(0, "© Donatien Garnier", '', false, 'C', true, 0, false, false, 0);
    $pdf->Write(0, "www.arbre-integral.net", '', false, 'C', true, 0, false, false, 0);

    //Titre
    $pdf->AddPage();
    $pdf->Circle(53, 40, 27, 0, 360, 'F', null, array(0,0,0));
    $pdf->ImageSVG($aiBooksSrc."ai_typo_white_arbre.svg", 36, 29, '', 10, '', '', 1, false);
    $pdf->ImageSVG($aiBooksSrc."ai_typo_white_integral.svg", 31, 39, '', 10, '', '', 1, false);
    $pdf->setY(72);
    $pdf->SetFont('sanchez', '', 10);
    $pdf->Write(0, "par", '', false, 'C', true, 0, false, false, 0);
    $pdf->SetFont('sanchez', '', 12);
    $pdf->Write(0, "Donatien Garnier", '', false, 'C', true, 0, false, false, 0);
    $pdf->SetFont('sanchez', '', 8);
    $pdf->Write(0, "graphisme Franck Tallon", '', false, 'C', true, 0, false, false, 0);
    $pdf->setY(-30);
    $pdf->SetFont('sanchez', '', 6);
    $pdf->Write(0, "© Donatien Garnier", '', false, 'C', true, 0, false, false, 0);
    $pdf->Write(0, "www.arbre-integral.net", '', false, 'C', true, 0, false, false, 0);

    //Page blanche
    $pdf->AddPage();

    //Exergue
    $pdf->AddPage();
    $pdf->SetY(30);
    $pdf->SetX(30);
    $pdf->SetFont('sanchez', '', 9);
    $pdf->MultiCell(47, 0, "Qu’enregistrerait-on dans une forêt (série de configurations ressemblantes) qu’on ne parcourrait qu’une seule fois sinon le risque de s’y perdre / (et d’ailleurs) à partir de quel stade d’enfoncement ? /", 0, 'L');
    $pdf->SetY(65);
    $pdf->SetX(30);
    $pdf->SetFont('sanchez', '', 7);
    $pdf->Write(10, "Cécile Mainardi");
    $pdf->SetY(68);
    $pdf->SetX(30);
    $pdf->SetFont('sanchez', 'I', 7);
    $pdf->Write(10, "La forêt de Porphyre");

    //Page blanche
    $pdf->AddPage();

    //TODO Dedicace (ex libris...)
    $pdf->AddPage();
    $pdf->SetY(30);
    $pdf->SetX(30);
    $pdf->SetFont('sanchez', 'I', 9);
    $pdf->MultiCell(55, 0, "Ex libris arbre idéal", 0, 'R');

    //Page blanche
    $pdf->AddPage();

    //=========== Main content
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
      $html = '<div style="line-height: 0.7cm;">'.str_replace('-', ' - ', $content).'</div>';
      $pdf->WriteHTMLCell(60, 15, 22, 35, $html,  0,  0,  false,  true, 'C', true);

      //Set infos for footer
      $pdf->currentLeafPath = $leafpath;
    } 

    //======== Last pages 
    $pdf->setPrintFooter(false);

    //Page blanche
    $pdf->AddPage();

    //Du même auteur
    $lineHeight = 3;
    $fontHeight = 8;
    $pdf->SetFont('sanchez', '', $fontHeight);
    $pdf->SetMargins(25, 20, 0);
    $pdf->AddPage();
    $pdf->Write($lineHeight, 'Du même auteur :');
    $pdf->Ln();
    $pdf->Ln();
    $pdf->Ln();

    $pdf->SetFont('sanchez', '', 7);
    $pdf->Write($lineHeight, 'OBJETS CONVERGENTS');
    $pdf->Ln();
    $pdf->Ln();
    $pdf->SetFont('sanchez', 'I', $fontHeight);
    $pdf->Ln();
    $pdf->Write($lineHeight, 'Le Bibliomane,');
    $pdf->Ln();
    $pdf->SetFont('sanchez', '', $fontHeight);
    $pdf->Write($lineHeight, 'Les bords perdus, 2016.');
    $pdf->Ln();
    $pdf->Write($lineHeight, 'Avec Walid Salem');
    $pdf->Ln();
    $pdf->Ln();

    $pdf->SetFont('sanchez', 'I', $fontHeight);
    $pdf->Write($lineHeight, 'Fluxus, destin pulsé,');
    $pdf->Ln();
    $pdf->SetFont('sanchez', '', $fontHeight);
    $pdf->Write($lineHeight, 'Atelier B A I E / Le poème en volume, 2015.');
    $pdf->Ln();
    $pdf->Write($lineHeight, 'Avec Guillaume Bullat');
    $pdf->Ln();
    $pdf->Ln();
    $pdf->SetFont('sanchez', 'I', $fontHeight);
    $pdf->Write($lineHeight, 'Le Recueil d’Écueils');
    // $pdf->Ln();
    $pdf->SetFont('sanchez', '', $fontHeight);
    $pdf->Write($lineHeight, ', Sun / Sun, 2015.');
    $pdf->Ln();
    $pdf->Write($lineHeight, 'Avec Guillaume Bullat');
    $pdf->Ln();
    $pdf->Ln();
    $pdf->SetFont('sanchez', 'I', $fontHeight);
    $pdf->Write($lineHeight, 'matcH');
    // $pdf->Ln();
    $pdf->SetFont('sanchez', '', $fontHeight);
    $pdf->Write($lineHeight, ', Atelier B A I E, 2013');
    $pdf->Ln();
    $pdf->Write($lineHeight, 'Avec Éric des Garets');
    $pdf->Ln();
    $pdf->Ln();
    $pdf->SetFont('sanchez', 'I', $fontHeight);
    $pdf->Write($lineHeight, 'GEANTs');
    // $pdf->Ln();
    $pdf->SetFont('sanchez', '', $fontHeight);
    $pdf->Write($lineHeight, 'Voix édition, Collection Fireboox 2010 Avec Guillaume Bullat');

    $pdf->Ln();
    $pdf->Ln();
    $pdf->Ln();
    $pdf->SetFont('sanchez', '', 7);
    $pdf->Write($lineHeight, 'DOCUMENTAIRES');
    $pdf->Ln();
    $pdf->Ln();
    $pdf->SetFont('sanchez', 'I', $fontHeight);
    $pdf->Write($lineHeight, 'Gueule d’Hexagone');
    // $pdf->Ln();
    $pdf->SetFont('sanchez', '', $fontHeight);
    $pdf->Write($lineHeight, ', Intervalles, 2012.');
    $pdf->Ln();
    $pdf->Write($lineHeight, 'Avec le Collectif Argos');
    $pdf->Ln();
    $pdf->Ln();
    $pdf->SetFont('sanchez', 'I', $fontHeight);
    $pdf->Write($lineHeight, 'Réfugiés climatiques');
    // $pdf->Ln();
    $pdf->SetFont('sanchez', '', $fontHeight);
    $pdf->Write($lineHeight, ', Dominique Carré, 2010.');
    $pdf->Ln();
    $pdf->Write($lineHeight, 'Avec le Collectif Argos');

    //Achevé le
    $pdf->SetMargins(25, 0, 0);
    $pdf->AddPage();
    $pdf->SetXY(14, 100);
    $pdf->SetFont('sanchez', '', 6);
    $pdf->WriteHTMLCell(80, 0, 14, 100, "Le nombre de parcours possibles dans l’Arbre Intégral s’élève à
13609281768511352141614530021521537575061761777958692042875.<br>
Le parcours constituant ce livre correspond à la ".$edition_id."<sup>e</sup> possibilité.<br>
Il a été achevé le ".date('d/m/Y')." par le ".$visitorId."<sup>e</sup> lecteur de l’ensemble du poème.
<br><br>
Projet soutenu dans le cadre de La Fabrique #2015 - Région Aquitaine", 0, 0, false, true, 'C');
    $pdf->ImageSVG($aiBooksSrc."region_aquitaine.svg", 15, 120, '', 6, '', '', 1, false);
    $pdf->ImageSVG($aiBooksSrc."cultures_connectees.svg", 47, 120, '', 6, '', '', 1, false);
    $pdf->ImageSVG($aiBooksSrc."poeme_volume.svg", 63, 120, '', 6, '', '', 1, false);

    //Close and output PDF document
    $pdf->Output($pdfFile, 'F');
  }
}

function getLeafPath($leafid){
  $binary = decbin($leafid);
  $forks = str_split($binary);
  $forks[0] = 0;
  return join('', $forks);
}

/*******************************************
 * Cover 
 */

function createCover($id, $svg){
  global $aiBooksDir;
  global $aiBooksSrc;

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
    $pdf->SetFillColor(171,208,184);
    $pdf->Cell(0 , $docHeight * 2 / 3 , '', 0, 0, 'C', true);

    $pdf->SetY($docHeight * 2 / 3);
    $pdf->SetFillColor(0, 0, 0);
    $pdf->Cell(0 , $docHeight / 3 , '', 0, 0, 'C', true);

    $pdf->ImageSVG($aiBooksSrc."ai_typo_arbre.svg", 15, 17, '', 12, '', '', 1, false);
    $pdf->ImageSVG($aiBooksSrc."ai_typo_integral.svg", 15, 32, '', 12, '', '', 1, false);

    $pdf->ImageSVG($aiBooksSrc."logo_white.svg", 92, 8, '', 10, '', '', 1, false);

    $svgSize = 90;
    $pdf->ImageSVG($svgFile, ($docWidth -$svgSize)/2, 54 , '', '', '', '', 1, false);

    // $pdf->SetFont('helvetica', '', 8);
    $pdf->SetXY(15, 50);
    $pdf->SetFont('sanchez', '', 14);
    $pdf->Write(0, 'Donatien Garnier', '', 0, 'L', true, 0, false, false, 0);

    $pdf->SetY(135);
    $pdf->SetTextColor(250,250,250);
    $pdf->SetFont('sanchez', '', 8);
    $pdf->Cell(0, 10, 'parcours '.$id, 0, false, 'C', 0, '', 0, false, 'T', 'M');

    // ---------------------------------------------------------

    //Close and output PDF document
    $pdf->Output($pdfFile, 'F');

  }
}
