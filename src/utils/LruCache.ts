import type Node from '../node/Node'

// 节点缓冲池类
class LruCache {
  private readonly pool: Map<string, Node>
  private readonly opacity: number
  private size: number

  constructor (opacity: number) {
    this.opacity = opacity
    this.size = 0
    this.pool = new Map()
  }

  // 往缓冲池里添加节点
  add (uid: string, node: Node): void {
    // 若有重复先删除
    this.delete(uid)
    this.pool.set(uid, node)
    this.size++
    // 若超出缓存容量则淘汰最久未使用的节点
    if (this.size > this.opacity) {
      const iter = this.pool.keys()
      const longestUnused = iter.next()
      this.delete(longestUnused.value)
    }
  }

  // 删除缓冲池里的节点
  delete (uid: string): void {
    if (this.has(uid)) {
      this.pool.delete(uid)
      this.size--
    }
  }

  // 判断缓冲池里有无此节点
  has (uid: string): boolean {
    return this.pool.has(uid)
  }

  // 获取缓冲池中的节点
  get (uid: string): Node | undefined {
    // if (this.has(uid)) {
    //   return this.pool.get(uid)
    // }
    const val = this.pool.get(uid)
    if (val) {
      this.add(uid, val)
    }
    return val
  }
}

export default LruCache
