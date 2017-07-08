import Init from './init'
import Misc from './misc'
import Auth from './auth'
import Help from './help'
import Balance from './balance'

export default {
    misc: new Misc(),
    auth: new Auth(),
    help: new Help(),
    balance: new Balance(),
    init: new Init()
}
