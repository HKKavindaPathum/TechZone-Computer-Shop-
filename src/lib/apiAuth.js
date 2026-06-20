import jwt from 'jsonwebtoken';

export function verifyAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: No token provided');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // Returns { userId, role }
  } catch (err) {
    throw new Error('Unauthorized: Invalid token');
  }
}

export function verifyAdmin(request) {
  const user = verifyAuth(request);
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access only');
  }
  return user;
}
