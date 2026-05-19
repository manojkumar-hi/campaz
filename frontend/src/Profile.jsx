import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { API_BASE_URL } from "./api";

export default function Profile({ posts, setPosts, user, setUser }) {
  // Update profile handler at top-level
  const handleProfileUpdate = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("name", profileName);
    formData.append("bio", profileBio);
    if (profilePic) {
      formData.append("file", profilePic);
    }
    fetch(`${API_BASE_URL}/auth/profile/update`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to update profile"))
      .then(data => {
        setUser(data);
        setEditProfile(false);
        // Refetch posts so updated profile info appears everywhere
        fetch(`${API_BASE_URL}/posts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
          .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch posts"))
          .then(postsData => setPosts(postsData))
          .catch(() => setPosts([]));
      })
      .catch(() => alert("Failed to update profile"))
      .finally(() => setLoading(false));
  };
  // Profile update
  const [editProfile, setEditProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  // Remove local user state, use props from App.jsx
  const [error, setError] = useState("");
  const [newPost, setNewPost] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [badge, setBadge] = useState("");
  const [loading, setLoading] = useState(false);
  // Remove profile picture handler
  const handleRemoveProfilePic = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/auth/profile/remove-pic`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to remove profile picture"))
      .then(data => {
        setUser(data); // update user state everywhere
        localStorage.setItem("user", JSON.stringify(data)); // sync localStorage
        setProfilePic(null);
        setEditProfile(false);
      })
      .catch(() => alert("Failed to remove profile picture"))
      .finally(() => setLoading(false));
  };

  // Fetch user profile
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileBio(user.bio || "");
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  // Function to dynamically calculate badge
  const calculateBadge = (postsArray) => {
    const totalPosts = postsArray.length;
    const totalComments = postsArray.reduce(
      (acc, p) => acc + (p.comments?.length || 0),
      0
    );
    const activityScore = totalPosts + totalComments;
    if (activityScore === 0) return "🐣 Newbie";
    else if (activityScore <= 3) return "🌱 Beginner";
    else if (activityScore <= 7) return "⚡ Active";
    else return "🔥 Superstar";
  };

  // Fetch posts from backend on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/posts`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch posts"))
      .then(data => setPosts(data))
      .catch(() => setPosts([]));
  }, [setPosts]);

  // Update badge whenever posts change
  useEffect(() => {
  // Only count posts created by the logged-in user
  const userPosts = posts.filter(post => post.user_id === user?.id);
  setBadge(calculateBadge(userPosts));
  }, [posts]);

  // Helper to convert image file to Base64
  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Like/Unlike post
  const handleLike = async (post) => {
    const currentUserId = user?._id;
    // Optimistically update UI for instant feedback
    setPosts(prevPosts => prevPosts.map(p => {
      if (p.id !== post.id) return p;
      const alreadyLiked = p.likes.includes(currentUserId);
      const newLikes = alreadyLiked
        ? p.likes.filter(uid => uid !== currentUserId)
        : [...p.likes, currentUserId];
      return {
        ...p,
        likes: newLikes
      };
    }));
    const token = localStorage.getItem("token");
    const url = `${API_BASE_URL}/posts/${post.id}/${post.likes.includes(currentUserId) ? "unlike" : "like"}`;
    fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to update like"))
      .then(() => {
        fetch(`${API_BASE_URL}/posts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
          .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch posts"))
          .then(data => setPosts(data))
          .catch(() => setPosts([]));
      });
  };
  const handleCreatePost = async () => {

  // Add comment
  const handleComment = async (post, text) => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/posts/${post.id}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text })
    })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to add comment"))
      .then(() => {
        fetch(`${API_BASE_URL}/posts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
          .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch posts"))
          .then(data => {
            const currentUserId = localStorage.getItem("user_id");
            const postsWithLiked = Array.isArray(data)
              ? data.map(post => ({
                  ...post,
                  liked: Array.isArray(post.likes) && post.likes.includes(currentUserId)
                }))
              : [];
            setPosts(postsWithLiked);
          })
          .catch(() => setPosts([]));
      });
  };

  // Delete comment
  const handleDeleteComment = async (post, commentId) => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/posts/${post.id}/comment/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to delete comment"))
      .then(() => {
        fetch(`${API_BASE_URL}/posts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
          .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch posts"))
          .then(data => setPosts(data))
          .catch(() => setPosts([]));
      });
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    const token = localStorage.getItem("token");
    console.log("Attempting to delete post:", postId);
    fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Delete post failed:", errorText);
          alert(`Delete post failed: ${errorText}`);
          throw new Error(errorText);
        }
        return res.json();
      })
      .then(response => {
        console.log("Delete post response:", response);
        fetch(`${API_BASE_URL}/posts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
          .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch posts"))
          .then(data => setPosts(data))
          .catch(err => {
            console.error("Error fetching posts after delete:", err);
            setPosts([]);
          });
      })
      .catch(err => {
        console.error("Delete post error:", err);
        alert(`Delete post error: ${err}`);
      });
  };

  // Update profile
  const handleProfileUpdate = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("name", profileName);
    formData.append("bio", profileBio);
    if (profilePic) {
      formData.append("file", profilePic);
    }
    fetch(`${API_BASE_URL}/auth/profile/update`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => Promise.reject(data.detail || "Failed to update profile"));
        }
        return res.json();
      })
      .then(data => {
        setUser(data);
        setEditProfile(false);
        alert("Profile updated successfully!");
      })
      .catch(err => {
        console.error("Profile update error:", err);
        alert(`Failed to update profile: ${err}`);
      })
      .finally(() => setLoading(false));
  };
    if (!newPost.trim() && !newImage) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("content", newPost);
    if (newImage) {
      formData.append("file", newImage); // Use 'file' for backend compatibility
    }
    fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData
    })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to create post"))
      .then(post => {
        // Refetch posts for consistency
        fetch(`${API_BASE_URL}/posts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
          .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch posts"))
          .then(data => setPosts(data))
          .catch(() => setPosts([]));
      })
      .catch(() => alert("Failed to create post"))
      .finally(() => {
  setLoading(false);
  setNewPost("");
  setNewImage(null);
  const fileInput = document.getElementById('profile-image-input');
  if (fileInput) fileInput.value = '';
      });
  };

  if (error)
    return (
      <div style={{ color: "#ff4d4f", textAlign: "center", marginTop: "2rem" }}>
        {error}
      </div>
    );
  if (!user)
    return (
      <div style={{ color: "#00c6ff", textAlign: "center", marginTop: "2rem" }}>
        Loading...
      </div>
    );

  return (
  <div className="container py-4">
      {/* Top section: User details and Create Post side by side */}
      <div
        className="d-flex align-items-stretch gap-2 mb-4"
        style={{ flexWrap: "wrap" }}
      >
        {/* User Details Box */}
        <div
          className="bg-dark text-light p-3 rounded shadow-sm d-flex flex-row align-items-center flex-grow-1 position-relative"
          style={{
            flex: 1,
            minWidth: "0",
            height: "280px", // Fixed height to match Create Post box
            overflow: "hidden"
          }}
        >
          <div style={{ position: 'relative', marginRight: '10px' }}>
            <img
              src={user.profilePic || "/default-profile.png"}
              alt="Profile"
              className="rounded-circle"
              style={{
                width: "90px",
                height: "90px",
                objectFit: "cover",
                border: "3px solid #00c6ff",
              }}
            />
          </div>
          <div className="d-flex flex-column justify-content-center" style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <strong style={{ minWidth: "70px" }}>Username:</strong>
              <span>{user.name || "Guest"}</span>
            </div>
            <div
              style={{
                display: "flex",
                gap: "6px",
                alignItems: "center",
                marginTop: "6px",
              }}
            >
              <strong style={{ minWidth: "70px" }}>Bio:</strong>
              <span>{user.bio || "No bio available"}</span>
            </div>

            {/* Dynamic Badge */}
            {/* Badge at top right */}
            {badge && (
              <span
                className="badge position-absolute"
                style={{
                  top: "16px",
                  right: "16px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  background: "linear-gradient(145deg, #1e1f23, #2c2d30)",
                  color: "#fff",
                  border: "1px solid #00c6ff",
                  boxShadow: "0 0 6px #00c6ff88",
                  zIndex: 2
                }}
              >
                {badge}
              </span>
            )}

            <button
              className="btn btn-primary btn-sm d-flex align-items-center gap-2"
              style={{ marginTop: "18px", width: "fit-content", minWidth: "0", padding: "2px 8px", fontSize: "0.95rem", background: "#00c6ff", border: "none", color: "#fff", fontWeight: "bold", borderRadius: "8px", boxShadow: "0 2px 8px #00c6ff44" }}
              onClick={() => setEditProfile(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginRight: "4px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm0 0V17h4" />
              </svg>
              Edit Profile
            </button>
          </div>
        </div>

        {/* Create Post Box */}
        <div
          className="bg-dark text-light p-3 rounded shadow-sm flex-grow-1 d-flex flex-column"
          style={{
            flex: 1,
            minWidth: "0",
            height: "280px", // Same height as User box
          }}
        >
          <h5 className="mb-2" style={{ color: "#00c6ff" }}>
            Create Post
          </h5>
          <textarea
            rows="2"
            className="form-control bg-secondary text-light mb-1"
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            style={{
              resize: "vertical",
              minHeight: "48px",
              maxHeight: "120px",
              fontSize: "1rem",
            }}
          ></textarea>
          <input
            id="profile-image-input"
            type="file"
            accept="image/*"
            className="form-control bg-secondary text-light mb-1"
            onChange={(e) => setNewImage(e.target.files[0])}
            style={{ fontSize: "0.95rem" }}
          />
          {newImage && (
            <div className="d-flex align-items-center mb-2" style={{ gap: "8px" }}>
              <span style={{ color: '#00c6ff', fontWeight: 'bold', fontSize: '0.98rem' }}>
                {newImage.name}
              </span>
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  border: '2px solid #00c6ff',
                  background: 'transparent',
                  color: '#00c6ff',
                  borderRadius: '50%',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s, color 0.2s',
                  cursor: 'pointer',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#00c6ff';
                  e.currentTarget.style.color = '#23272b';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#00c6ff';
                }}
                onClick={() => {
                  setNewImage(null);
                  const fileInput = document.getElementById('profile-image-input');
                  if (fileInput) fileInput.value = '';
                }}
                aria-label="Remove selected image"
              >
                <X size={18} />
              </button>
            </div>
          )}
          <button
            className="btn btn-primary btn-sm mt-auto"
            style={{ alignSelf: "flex-end" }}
            onClick={handleCreatePost}
            disabled={loading}
          >
            {loading ? "Posting..." : "Share Post"}
          </button>
        </div>
      </div>

      {/* User's Posts */}
      <div className="posts-container mt-4">
        <h4 className="mb-3" style={{ color: "#00c6ff" }}>Your Posts</h4>
        {(!Array.isArray(posts) || posts.length === 0) ? (
          <div className="text-center" style={{ color: "#00c6ff", fontWeight: "bold", fontSize: "1.1rem", margin: "16px 0" }}>No posts yet.</div>
        ) : (
          <div className="d-flex flex-wrap" style={{ gap: "24px" }}>
            {posts.filter(post => post.user_id === user.id).map((post) => (
              <div
                key={post.id}
                className="post-card mb-4 p-4 bg-dark rounded shadow-sm d-flex flex-column"
                style={{
                  maxWidth: "500px",
                  minHeight: post.image ? "350px" : "120px",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "visible",
                  height: post.image ? undefined : "auto",
                }}
              >
                {post.reposted && (
                  <span style={{ position: "absolute", top: 8, left: 8, background: "#ff9800", color: "#fff", borderRadius: "8px", padding: "2px 10px", fontWeight: "bold", fontSize: "0.95rem", zIndex: 3 }}>
                    Reposted
                  </span>
                )}
                <div className="d-flex align-items-center mb-2">
                  <img
                    src={user.profilePic || "/default-profile.png"}
                    alt="Profile"
                    className="rounded-circle me-2"
                    style={{ width: "40px", height: "40px" }}
                  />
                  <strong>{user.name || "User"}</strong>
                </div>
                <p style={{ minHeight: "80px", fontSize: "1.15rem" }}>{post.content}</p>
                {post.image && (
                  <img
                    src={post.image}
                    alt="post"
                    style={{ width: "100%", borderRadius: "6px", marginTop: "10px" }}
                  />
                )}
                <div className="flex-grow-1" style={{ minHeight: "40px" }}></div>
                <div className="d-flex align-items-center gap-3 mt-auto pt-3" style={{ justifyContent: "flex-start", background: "inherit", zIndex: 2 }}>
                  <button
                    className={`d-flex align-items-center px-0 py-0 bg-transparent text-gray-400 hover:text-blue-400 transition-all duration-200${post.likes.includes(user._id) ? ' liked' : ''}`}
                    style={{ boxShadow: "none", border: "none", background: "transparent", color: post.likes.includes(user._id) ? "#00c6ff" : "#888", fontWeight: 600, fontSize: "1.1rem", cursor: "pointer", outline: "none" }}
                    onClick={() => handleLike(post)}
                  >
                    <svg width="24" height="24" fill="none" stroke={post.likes.includes(user._id) ? "#00c6ff" : "#888"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M14 9V5a3 3 0 0 0-6 0v4"/><path d="M5 15h14l-1.34 5.34A2 2 0 0 1 15.7 22H8.3a2 2 0 0 1-1.96-1.66L5 15z"/></svg>
                    {Array.isArray(post.likes) ? post.likes.length : 0}
                  </button>
                  <div style={{ position: "relative", flex: 1, minWidth: "180px" }}>
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="comment-input form-control form-control-sm text-gray-900 border-0 rounded-lg"
                      style={{ width: "100%", background: "#3a3f44", color: "#eee", paddingRight: "36px" }}
                      value={post._commentInput || ""}
                      onChange={e => {
                        post._commentInput = e.target.value;
                        setPosts([...posts]);
                      }}
                      onKeyDown={e => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          handleComment(post, e.target.value);
                          post._commentInput = "";
                          setPosts([...posts]);
                        }
                      }}
                    />
                    <button
                      className="btn btn-sm"
                      style={{
                        position: "absolute",
                        right: "6px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "#00c6ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer"
                      }}
                      title="Send Comment"
                      onClick={() => {
                        if (post._commentInput && post._commentInput.trim()) {
                          handleComment(post, post._commentInput);
                          post._commentInput = "";
                          setPosts([...posts]);
                        }
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00c6ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                  </div>
                  <button
                    className="btn btn-sm ms-2"
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff4d4f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "1.2rem"
                    }}
                    title="Delete Post"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m5 6v6m4-6v6M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
                {/* Comments List */}
                {post.comments && post.comments.length > 0 && (
                  <div className="mt-2">
                    {post.comments.map((c, idx) => (
                      <div key={idx} style={{ color: "#ccc", fontSize: "0.95rem", marginBottom: "4px", display: "flex", alignItems: "center" }}>
                        <span style={{ color: "#00c6ff", fontWeight: "bold" }}>Comment:</span> {c.text}
                        <button
                          className="btn btn-xs btn-outline-danger ms-2"
                          style={{ fontSize: "0.8rem", padding: "2px 6px" }}
                          onClick={() => handleDeleteComment(post, c.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
  {editProfile && (
    <div className="modal" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#000a", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="bg-dark text-light p-4 rounded shadow" style={{ minWidth: "320px", maxWidth: "90vw" }}>
        <h5 style={{ color: "#00c6ff" }}>Edit Profile</h5>
        <input
          type="text"
          className="form-control mb-2"
          value={profileName}
          onChange={e => setProfileName(e.target.value)}
          placeholder="Name"
        />
        <textarea
          className="form-control mb-2"
          value={profileBio}
          onChange={e => setProfileBio(e.target.value)}
          placeholder="Bio"
        />
        <input
          type="file"
          accept="image/*"
          className="form-control mb-2"
          onChange={e => setProfilePic(e.target.files[0])}
        />
        {user?.profilePic && (
          <button
            className="btn btn-danger btn-sm mb-2 d-flex align-items-center gap-2"
            style={{ width: "fit-content", minWidth: "0", padding: "4px 12px", fontSize: "0.95rem", borderRadius: "6px" }}
            onClick={handleRemoveProfilePic}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m5 6v6m4-6v6M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><polyline points="3 6 5 6 21 6"/></svg>
            {loading ? "Removing..." : "Remove Profile"}
          </button>
        )}
        <div className="d-flex gap-2 mt-2">
          <button className="btn btn-primary" onClick={handleProfileUpdate} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button className="btn btn-secondary" onClick={() => setEditProfile(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}
    </div>
  );
}
const calculateBadge = (postsArray) => {
  const totalPosts = postsArray.length;
  const totalComments = postsArray.reduce(
    (acc, p) => acc + (p.comments?.length || 0),
    0
  );
  const activityScore = totalPosts + totalComments;
  if (activityScore === 0) return "🐣 Newbie";
  else if (activityScore <= 3) return "🌱 Beginner";
  else if (activityScore <= 7) return "⚡ Active";
  else return "🔥 Superstar";
};