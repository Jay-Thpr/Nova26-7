export function GenericSkeleton() {
  return <div className="skel-generic" style={{ padding: '96px 24px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
    <div className="skel-line skel-line-heading" style={{ width: 240 }} />
    <div className="skel-line" style={{ width: 360 }} />
    <div className="skel-block" style={{ width: '100%', maxWidth: 960, height: 320 }} />
  </div>
}
