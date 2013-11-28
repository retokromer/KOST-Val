/*== KOST-Val ==================================================================================
The KOST-Val application is used for validate TIFF, SIARD, and PDF/A-Files. 
Copyright (C) 2012-2013 Claire R�thlisberger (KOST-CECO), Christian Eugster, Olivier Debenath, 
Peter Schneider (Staatsarchiv Aargau)
-----------------------------------------------------------------------------------------------
KOST-Val is a development of the KOST-CECO. All rights rest with the KOST-CECO. 
This application is free software: you can redistribute it and/or modify it under the 
terms of the GNU General Public License as published by the Free Software Foundation, 
either version 3 of the License, or (at your option) any later version. 
This application is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
See the follow GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with this program; 
if not, write to the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, 
Boston, MA 02110-1301 USA or see <http://www.gnu.org/licenses/>.
==============================================================================================*/

package ch.kostceco.tools.kostval.validation.modulepdfa.impl;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import ch.kostceco.tools.kostval.exception.modulepdfa.ValidationDfontsException;
import ch.kostceco.tools.kostval.service.ConfigurationService;
import ch.kostceco.tools.kostval.util.Util;
import ch.kostceco.tools.kostval.validation.ValidationModuleImpl;
import ch.kostceco.tools.kostval.validation.modulepdfa.ValidationDfontsModule;

/**
 * PDFA Validierungs mit PDFTron. Ist die vorliegende PDF-Datei eine valide
 * PDFA-Datei
 * 
 * @author Rc Claire R�thlisberger, KOST-CECO
 */

public class ValidationDfontsModuleImpl extends ValidationModuleImpl implements
		ValidationDfontsModule
{

	private ConfigurationService	configurationService;

	public static String			NEWLINE	= System.getProperty( "line.separator" );

	public ConfigurationService getConfigurationService()
	{
		return configurationService;
	}

	public void setConfigurationService(
			ConfigurationService configurationService )
	{
		this.configurationService = configurationService;
	}

	@Override
	public boolean validate( File valDatei, File directoryOfLogfile )
			throws ValidationDfontsException
	{

		boolean valid = true;

		boolean isValid = true;
		boolean erkennung = false;

		// PDF-Datei an Pdftron �bergeben wenn die Erkennung erfolgreich
		erkennung = valid;
		if ( erkennung = true ) {
			// Informationen zum PDFTRON-Logverzeichnis holen
			String pathToPdftronOutput = directoryOfLogfile.getAbsolutePath();

			/*
			 * Nicht vergessen in
			 * "src/main/resources/config/applicationContext-services.xml" beim
			 * entsprechenden Modul die property anzugeben: <property
			 * name="configurationService" ref="configurationService" />
			 */

			try {
				// Report holen und weiter auswerten
				File report = new File( pathToPdftronOutput, valDatei.getName()
						+ ".pdftron-log.xml" );

				String pathToPdftronReport = report.getAbsolutePath();

				Util.setPathToReportPdftron( pathToPdftronReport );

				BufferedInputStream bis = new BufferedInputStream(
						new FileInputStream( pathToPdftronReport ) );
				DocumentBuilderFactory dbf = DocumentBuilderFactory
						.newInstance();
				DocumentBuilder db = dbf.newDocumentBuilder();
				Document doc = db.parse( bis );
				doc.normalize();

				Integer passCount = new Integer( 0 );
				NodeList nodeLstI = doc.getElementsByTagName( "Pass" );

				// Valide pdfa-Dokumente enthalten
				// "<Validation> <Pass FileName..."
				// Anzahl pass = anzahl Valider pdfa
				for ( int s = 0; s < nodeLstI.getLength(); s++ ) {
					passCount = passCount + 1;
					// Valide PDFA-Datei
					// Module A-J sind Valid
					isValid = true;
				}

				if ( passCount == 0 ) {
					// Invalide PDFA-Datei

					// aus dem Output von Pdftron die Fehlercodes extrahieren
					// und �bersetzen

					NodeList nodeLst = doc.getElementsByTagName( "Error" );
					// Bsp. f�r einen Error Code: <Error Code="e_PDFA173"
					// die erste Ziffer nach e_PDFA ist der Error Code.
					for ( int s = 0; s < nodeLst.getLength(); s++ ) {
						Node dateiNode = nodeLst.item( s );
						NamedNodeMap nodeMap = dateiNode.getAttributes();
						Node errorNode = nodeMap.getNamedItem( "Code" );
						String errorCode = errorNode.getNodeValue();
						Node errorNodeM = nodeMap.getNamedItem( "Message" );
						String errorMessage = errorNodeM.getNodeValue();
						String errorDigit = errorCode.substring( 6, 7 );

						// der Error Code kann auch "Unknown" sein, dieser wird
						// in
						// den Code "0" �bersetzt
						if ( errorDigit.equals( "U" ) ) {
							errorDigit = "0";
						}
						if ( errorDigit.equals( "n" ) ) {
							errorDigit = "0";
						}
						/*
						 * System.out.print( "errorDigit = " + errorDigit +
						 * " > errorMessage = " + errorMessage + "  " );
						 */

						if ( errorDigit.equals( "3" ) ) {
							// Schrift Fehler -> D
							isValid = false;
							getMessageService()
									.logError(
											getTextResourceService().getText(
													MESSAGE_MODULE_D )
													+ getTextResourceService()
															.getText(
																	MESSAGE_DASHES )
													+ getTextResourceService()
															.getText(
																	ERROR_MODULE_AJ_PDFA_ERRORMESSAGE,
																	errorMessage ) );

						}
					}
				}
			} catch ( Exception e ) {
				getMessageService().logError(
						getTextResourceService().getText( MESSAGE_MODULE_D )
								+ getTextResourceService().getText(
										MESSAGE_DASHES ) + e.getMessage() );
				return false;
			}
		}
		valid = erkennung;

		return isValid;
	}

}