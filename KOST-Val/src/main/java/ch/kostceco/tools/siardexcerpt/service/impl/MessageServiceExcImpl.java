/* == SIARDexcerpt ==============================================================================
 * The SIARDexcerpt application is used for excerpt a record from a SIARD-File. Copyright (C)
 * Claire Roethlisberger (KOST-CECO)
 * -----------------------------------------------------------------------------------------------
 * SIARDexcerpt is a development of the KOST-CECO. All rights rest with the KOST-CECO. This
 * application is free software: you can redistribute it and/or modify it under the terms of the GNU
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version. This application is distributed in the hope that
 * it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the follow GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program; if
 * not, write to the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
 * 02110-1301 USA or see <http://www.gnu.org/licenses/>.
 * ============================================================================================== */

package ch.kostceco.tools.siardexcerpt.service.impl;

import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

import ch.kostceco.tools.kostval.logging.Logger;
import ch.kostceco.tools.siardexcerpt.service.MessageServiceExc;

public class MessageServiceExcImpl implements MessageServiceExc
{
	/** @author Rc Claire Roethlisberger, KOST-CECO */

	private static final Logger	LOGGER	= new Logger(
			MessageServiceExcImpl.class );

	List<String[]>				stack	= new LinkedList<String[]>();

	/*
	 * @Override public void logDebug( String message ) { this.stack.add( new
	 * String[] { MessageServiceExc.DEBUG, message } ); }
	 */

	@Override
	public void logError( String message )
	{
		this.stack.add( new String[] { MessageServiceExc.ERROR, message } );
	}

	@Override
	public void logFatal( String message )
	{
		this.stack.add( new String[] { MessageServiceExc.FATAL, message } );
	}

	/*
	 * @Override public void logInfo( String message ) { this.stack.add( new
	 * String[] { MessageServiceExc.INFO, message } ); }
	 */

	@Override
	public void logWarning( String message )
	{
		this.stack.add( new String[] { MessageServiceExc.WARN, message } );
	}

	@Override
	public void clear()
	{
		this.stack.removeAll( stack );
	}

	@Override
	public void print()
	{
		Iterator<String[]> it = this.stack.iterator();
		while ( it.hasNext() ) {
			String[] message = (String[]) it.next();
			if ( message[0].equals( MessageServiceExc.DEBUG ) ) {
				// LOGGER.logDebug( message[1] );
			}
			if ( message[0].equals( MessageServiceExc.ERROR ) ) {
				LOGGER.logError( message[1] );
			}
			if ( message[0].equals( MessageServiceExc.FATAL ) ) {
				LOGGER.logFatal( message[1] );
			}
			if ( message[0].equals( MessageServiceExc.INFO ) ) {
				// LOGGER.logInfo( message[1] );
			}
			if ( message[0].equals( MessageServiceExc.WARN ) ) {
				LOGGER.logWarning( message[1] );
			}
		}

		this.clear();

	}

}
