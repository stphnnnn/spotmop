from __future__ import unicode_literals

import logging
import os
import tornado.web
import tornado.websocket
import json
#import mem

#from services.sync import sync
from services.upgrade import upgrade
from services.pusher import pusher

#from services.queuemanager import core as QueueManagerCore
#from services.queuemanager import frontend
#from services.queuemanager import requesthandler as QueueManagerRequestHandler

from mopidy import config, ext

__version__ = '2.5.1'
__ext_name__ = 'spotmop'
__verbosemode__ = False

logger = logging.getLogger(__name__)

class SpotmopExtension(ext.Extension):
    dist_name = 'Mopidy-Spotmop'
    ext_name = __ext_name__
    version = __version__

    def get_default_config(self):
        conf_file = os.path.join(os.path.dirname(__file__), 'ext.conf')
        return config.read(conf_file)

    def get_config_schema(self):
        schema = super(SpotmopExtension, self).get_config_schema()
        schema['debug'] = config.Boolean()
        schema['pusherport'] = config.String()
        schema['pusherclientmap'] = config.String()
        return schema

    def setup(self, registry):
        #sync.Sync();
        
        # Create instances
        #mem.queuemanager = QueueManagerCore.QueueManager()

        # Add Queuemanager Frontend class
        #registry.add('frontend', frontend.QueueManagerFrontend)

        # Add web extension
        registry.add('http:app', {
            'name': self.ext_name,
            'factory': spotmop_client_factory
        })

        logger.info('Starting Spotmop web client')

def spotmop_client_factory(config, core):

	# TODO create minified version of the project for production (or use Bower or Grunt for building??)
    environment = 'dev' if config.get(__ext_name__)['debug'] is True else 'prod'
    spotmoppath = os.path.join( os.path.dirname(__file__), 'static')

    # PUSHER: TODO: need to fire this up from within the PusherHandler class... somehow
    pusherport = str(config['spotmop']['pusherport'])
    application = tornado.web.Application([
        ('/pusher', pusher.PusherHandler),
    ])
    application.listen(pusherport)
    logger.info( 'Pusher server running on []:'+ str(pusherport) )
	
    return [
		('/upgrade', upgrade.UpgradeRequestHandler, {'core': core, 'config': config, 'version': __version__ }),
		('/pusher/([^/]+)', pusher.PusherRequestHandler, {'core': core, 'config': config, 'version': __version__ }),
        (r'/(.*)', tornado.web.StaticFileHandler, {
            "path": spotmoppath,
            "default_filename": "index.html"
        }),
    ]