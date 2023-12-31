import fs from 'node:fs/promises'
import node_path, { resolve } from 'node:path'
import fg from 'fast-glob'
import { createFilter } from '@rollup/pluginutils'
import type { UnocssPluginContext } from '@unocss/core'
import { applyTransformers } from './transformers'

export async function setupContentExtractor(ctx: UnocssPluginContext, shouldWatch = false) {
  const { content } = await ctx.getConfig()
  const { extract, tasks, root } = ctx

  // inline text
  if (content?.inline) {
    await Promise.all(
      content.inline.map(async (c, idx) => {
        if (typeof c === 'function')
          c = await c()
        if (typeof c === 'string')
          c = { code: c }
        return extract(c.code, c.id ?? `__plain_content_${idx}__`)
      }),
    )
  }

  // filesystem
  if (content?.filesystem) {
    const files = await fg(content.filesystem, { cwd: root })
    const filter = createFilter(content.filesystem, [], { resolve: root })

    async function extractFile(file: string) {
      file = node_path.isAbsolute(file) ? file : node_path.resolve(root, file)
      if (!filter(file))
        return

      const code = await fs.readFile(file, 'utf-8')
      const preTransform = await applyTransformers(ctx, code, file, 'pre')
      const defaultTransform = await applyTransformers(ctx, preTransform?.code || code, file)
      await applyTransformers(ctx, defaultTransform?.code || preTransform?.code || code, file, 'post')
      return await extract(preTransform?.code || code, file)
    }

    if (shouldWatch) {
      const { watch } = await import('chokidar')
      const ignored = ['**/{.git,node_modules}/**']

      const watcher = watch(files, {
        ignorePermissionErrors: true,
        ignored,
        cwd: root,
        ignoreInitial: true,
      })

      watcher.on('all', (type, file) => {
        if (type === 'add' || type === 'change') {
          const absolutePath = resolve(root, file)
          tasks.push(extractFile(absolutePath))
        }
      })
    }

    await Promise.all(files.map(extractFile))
  }
}
