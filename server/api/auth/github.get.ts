export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user }) {
    const userFromEmail = await useDB()
      .select()
      .from(tables.users)
      .where(eq(tables.users.email, user.email || ''))
      .get()

    logger.chrono.info(
      'GitHub OAuth login:',
      user.email,
      userFromEmail ? 'Existing user' : 'New user',
    )

    if (!userFromEmail) {
      // create a new user without admin permission
      await useDB()
        .insert(tables.users)
        .values({
          username: user.name || '',
          email: user.email || '',
          avatar: user.avatar_url || null,
          createdAt: new Date(),
        })
        .returning()
        .get()
      // then reject login
      throw createError({
        statusCode: 403,
        statusMessage:
          'Access denied. Please contact the administrator to activate your account.',
      })
    } else if (userFromEmail.isAdmin === 0) {
      throw createError({
        statusCode: 403,
        statusMessage:
          'Access denied. Please contact the administrator to activate your account.',
      })
    } else {
      await setUserSession(event, { user: userFromEmail })
    }
    return sendRedirect(event, '/')
  },
  onError(_event) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication failed',
    })
  },
})
