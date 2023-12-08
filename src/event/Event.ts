import type BrainMap from '../../index'

interface EventOption {
  brainMap: BrainMap
}
class Event {
  brainMap: BrainMap
  constructor (opt: EventOption) {
    this.brainMap = opt.brainMap
  }
}

export default Event
